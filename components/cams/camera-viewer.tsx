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

export function CameraViewer({
  steamid,
  mode = "cover",
  rounded = false,
  muted = true,
  showFallback = false,
  fallbackPlayer,
  clean = false,
  showNameOverlay = false,
  className = "",
  onStatusChange,
  onPlayerChange
}: CameraViewerProps) {
  const normalizedSteamId = useMemo(() => normalizeSteamId64Client(steamid), [steamid]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>(normalizedSteamId ? "connecting" : "idle");
  const [player, setPlayer] = useState<PublicCameraPlayer | null>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  useEffect(() => {
    onPlayerChange?.(player);
  }, [onPlayerChange, player]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = remoteStream;
      if (remoteStream) {
        void videoRef.current.play().catch(() => undefined);
      }
    }
  }, [remoteStream]);

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
  const hasVideo = Boolean(remoteStream);

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
        className={`absolute inset-0 h-full w-full bg-transparent transition-opacity duration-200 ${mode === "contain" ? "object-contain" : "object-cover"} ${hasVideo ? "opacity-100" : "opacity-0"}`}
      />
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
