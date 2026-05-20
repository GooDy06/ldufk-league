"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CameraPlaceholder } from "@/components/cams/camera-placeholder";
import { getCamsSignalingUrl, getIceServers, normalizeSteamId64Client } from "@/lib/cams/client";
import type { CameraStatus, PublicCameraPlayer } from "@/lib/cams/types";

type CameraViewerProps = {
  steamid?: string | null;
  mode?: "cover" | "contain";
  rounded?: boolean;
  muted?: boolean;
  delaySeconds?: number;
  showFallback?: boolean;
  fallbackPlayer?: Partial<PublicCameraPlayer> | null;
  clean?: boolean;
  showNameOverlay?: boolean;
  className?: string;
  onStatusChange?: (status: CameraStatus) => void;
  onPlayerChange?: (player: PublicCameraPlayer | null) => void;
};

type SignalPayload = {
  from: string;
  target?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  player?: PublicCameraPlayer;
  reason?: string;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function clampDelaySeconds(value: number | undefined) {
  if (!Number.isFinite(value || 0)) return 0;
  return Math.max(0, Math.min(900, Math.floor(value || 0)));
}

function supportedRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm"
  ];

  return candidates.find((type) => {
    const recorderSupported = MediaRecorder.isTypeSupported(type);
    const mediaSourceSupported = typeof MediaSource === "undefined" || MediaSource.isTypeSupported(type);
    return recorderSupported && mediaSourceSupported;
  }) || "";
}

export function CameraViewer({
  steamid,
  mode = "cover",
  rounded = false,
  muted = true,
  delaySeconds = 0,
  showFallback = false,
  fallbackPlayer,
  clean = false,
  showNameOverlay = false,
  className = "",
  onStatusChange,
  onPlayerChange
}: CameraViewerProps) {
  const normalizedSteamId = useMemo(() => normalizeSteamId64Client(steamid), [steamid]);
  const safeDelaySeconds = useMemo(() => clampDelaySeconds(delaySeconds), [delaySeconds]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveDelayVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [delayedVideoReady, setDelayedVideoReady] = useState(false);
  const [status, setStatus] = useState<CameraStatus>(normalizedSteamId ? "connecting" : "idle");
  const [player, setPlayer] = useState<PublicCameraPlayer | null>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  useEffect(() => {
    onPlayerChange?.(player);
  }, [onPlayerChange, player]);

  useEffect(() => {
    const video = safeDelaySeconds > 0 ? liveDelayVideoRef.current : videoRef.current;
    if (!video || safeDelaySeconds > 0) return;

    video.src = "";
    video.srcObject = remoteStream;

    if (remoteStream) {
      void video.play().catch(() => undefined);
    }
  }, [remoteStream, safeDelaySeconds]);

  useEffect(() => {
    const video = videoRef.current;
    const liveVideo = liveDelayVideoRef.current;
    setDelayedVideoReady(false);

    if (!video || !remoteStream || safeDelaySeconds <= 0) {
      return () => undefined;
    }

    const videoElement = video;
    const liveVideoElement = liveVideo;
    const streamToRecord = remoteStream;
    const mimeType = supportedRecordingMimeType();
    if (!mimeType) {
      setStatus("error");
      return () => undefined;
    }

    let cancelled = false;
    let recorder: MediaRecorder | null = null;
    let appendTimer: number | null = null;
    let currentUrl: string | null = null;
    let mediaSource: MediaSource | null = null;
    let sourceBuffer: SourceBuffer | null = null;
    const recordedQueue: Array<{ blob: Blob; recordedAt: number }> = [];
    const pendingAppendQueue: Blob[] = [];
    const segmentMs = 1000;
    const delayMs = safeDelaySeconds * 1000;

    if (liveVideoElement) {
      liveVideoElement.srcObject = streamToRecord;
      liveVideoElement.muted = true;
      void liveVideoElement.play().catch(() => undefined);
    }

    function clearTimers() {
      if (appendTimer) window.clearInterval(appendTimer);
      appendTimer = null;
    }

    function revokeCurrentUrl() {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
        currentUrl = null;
      }
    }

    function appendNextBlob() {
      if (cancelled || !sourceBuffer || sourceBuffer.updating || !pendingAppendQueue.length) return;

      const nextBlob = pendingAppendQueue.shift();
      if (!nextBlob) return;

      nextBlob.arrayBuffer().then((buffer) => {
        if (cancelled || !sourceBuffer || sourceBuffer.updating) {
          pendingAppendQueue.unshift(new Blob([buffer], { type: mimeType }));
          return;
        }

        try {
          sourceBuffer.appendBuffer(buffer);
          setDelayedVideoReady(true);
          void videoElement.play().catch(() => undefined);
        } catch (error) {
          console.error("[cams] delayed append failed", error);
        }
      }).catch((error) => {
        console.error("[cams] delayed blob read failed", error);
      });
    }

    function moveReadySegments() {
      if (cancelled) return;

      const readyAt = Date.now() - delayMs;

      while (recordedQueue.length && recordedQueue[0].recordedAt <= readyAt) {
        const item = recordedQueue.shift();
        if (item) pendingAppendQueue.push(item.blob);
      }

      appendNextBlob();
    }

    function setupMediaSource() {
      mediaSource = new MediaSource();
      currentUrl = URL.createObjectURL(mediaSource);
      videoElement.srcObject = null;
      videoElement.src = currentUrl;
      videoElement.muted = muted;
      videoElement.onplaying = () => setDelayedVideoReady(true);
      videoElement.onloadeddata = () => setDelayedVideoReady(true);

      mediaSource.addEventListener("sourceopen", () => {
        if (!mediaSource || cancelled) return;

        sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        sourceBuffer.mode = "sequence";
        sourceBuffer.addEventListener("updateend", () => {
          appendNextBlob();

          try {
            const buffer = sourceBuffer;
            if (buffer && videoElement.currentTime > 20 && buffer.buffered.length) {
              const start = buffer.buffered.start(0);
              const removeBefore = videoElement.currentTime - 15;
              if (removeBefore > start && !buffer.updating) {
                buffer.remove(start, removeBefore);
              }
            }
          } catch {
            // Some OBS/Chromium builds are picky about buffer range removal.
          }
        });
      }, { once: true });
    }

    function startRecorder() {
      if (cancelled || !streamToRecord.active) return;

      recorder = new MediaRecorder(streamToRecord, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedQueue.push({
            blob: event.data,
            recordedAt: Date.now()
          });
        }
      };
      recorder.onerror = (event) => {
        console.error("[cams] delayed recorder error", event);
        setStatus("error");
      };
      recorder.start(segmentMs);
      appendTimer = window.setInterval(moveReadySegments, 250);
    }

    videoElement.pause();
    videoElement.srcObject = null;
    videoElement.removeAttribute("src");
    videoElement.load();

    setupMediaSource();
    startRecorder();

    return () => {
      cancelled = true;
      clearTimers();
      videoElement.onended = null;
      videoElement.onplaying = null;
      videoElement.onloadeddata = null;
      videoElement.onerror = null;
      if (liveVideoElement) {
        liveVideoElement.pause();
        liveVideoElement.srcObject = null;
      }

      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }

      revokeCurrentUrl();
      recordedQueue.length = 0;
      pendingAppendQueue.length = 0;

      if (mediaSource?.readyState === "open") {
        try {
          mediaSource.endOfStream();
        } catch {
          // Ignore cleanup races.
        }
      }
    };
  }, [muted, remoteStream, safeDelaySeconds]);

  useEffect(() => {
    let cancelled = false;

    function closePeer() {
      peerRef.current?.close();
      peerRef.current = null;
      setRemoteStream((current) => {
        stopStream(current);
        return null;
      });
    }

    closePeer();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setPlayer(null);

    if (!normalizedSteamId) {
      setStatus("idle");
      return () => undefined;
    }

    async function connect() {
      setStatus("connecting");
      const signalingUrl = getCamsSignalingUrl();

      if (!signalingUrl) {
        setStatus("error");
        return;
      }

      const iceServers = await getIceServers();
      if (cancelled) return;

      const socket = io(signalingUrl, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 8,
        timeout: 10000
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("viewer:join", { steamid: normalizedSteamId });
      });

      socket.on("viewer:ready", (payload: SignalPayload) => {
        if (payload.player) setPlayer(payload.player);
        setStatus("connecting");
      });

      socket.on("camera:offline", (payload: SignalPayload) => {
        if (payload.player) setPlayer(payload.player);
        closePeer();
        setStatus("offline");
      });

      socket.on("webrtc:offer", async (payload: SignalPayload) => {
        if (!payload.from || !payload.sdp) return;

        closePeer();

        const peer = new RTCPeerConnection({ iceServers });
        peerRef.current = peer;

        peer.ontrack = (event) => {
          const [stream] = event.streams;
          if (!stream) return;
          setRemoteStream(stream);
          setStatus("camera-active");
        };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc:ice-candidate", {
              target: payload.from,
              candidate: event.candidate.toJSON()
            });
          }
        };

        peer.onconnectionstatechange = () => {
          if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
            setStatus("offline");
          }
        };

        await peer.setRemoteDescription(payload.sdp);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("webrtc:answer", {
          target: payload.from,
          sdp: peer.localDescription
        });
      });

      socket.on("webrtc:ice-candidate", async (payload: SignalPayload) => {
        if (!payload.candidate || !peerRef.current) return;
        await peerRef.current.addIceCandidate(payload.candidate).catch(() => undefined);
      });

      socket.on("connect_error", () => {
        setStatus("error");
      });

      socket.on("disconnect", () => {
        closePeer();
        setStatus("disconnected");
      });
    }

    void connect();

    return () => {
      cancelled = true;
      closePeer();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [normalizedSteamId]);

  const activePlayer = player || fallbackPlayer || null;
  const hasVideo = safeDelaySeconds > 0 ? delayedVideoReady : Boolean(remoteStream);

  return (
    <div className={`relative h-full w-full overflow-hidden ${rounded ? "rounded-lg" : ""} ${className}`}>
      {showFallback ? (
        <CameraPlaceholder
          nickname={activePlayer?.nickname}
          teamName={activePlayer?.team_name}
          avatarUrl={activePlayer?.avatar_url}
          compact={clean}
        />
      ) : null}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={muted}
        controls={false}
        className={`absolute inset-0 h-full w-full bg-transparent transition-opacity duration-200 ${mode === "contain" ? "object-contain" : "object-cover"} ${hasVideo ? "opacity-100" : "opacity-0"}`}
      />
      {safeDelaySeconds > 0 ? (
        <video
          ref={liveDelayVideoRef}
          playsInline
          autoPlay
          muted
          controls={false}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      ) : null}
      {showNameOverlay && activePlayer?.nickname ? (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/45 to-transparent px-2 pb-1 pt-8 text-center">
          <div className="inline-block max-w-full truncate px-3 py-0.5 font-rajdhani text-2xl font-bold leading-none text-white [text-shadow:0_4px_14px_rgba(0,0,0,1),0_1px_4px_rgba(0,0,0,1)]">
            {activePlayer.nickname}
          </div>
        </div>
      ) : null}
    </div>
  );
}
