"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getCamsSignalingUrl, getIceServers } from "@/lib/cams/client";
import type { CameraPlayerWithRoom, CameraStatus } from "@/lib/cams/types";

type PlayerCameraClientProps = {
  token: string;
  player: CameraPlayerWithRoom;
};

type SignalPayload = {
  viewerId?: string;
  from?: string;
  target?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  error?: string;
};

function closePeers(peers: Map<string, RTCPeerConnection>) {
  peers.forEach((peer) => peer.close());
  peers.clear();
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function statusLabel(status: CameraStatus) {
  if (status === "camera-active") return "Camera active";
  if (status === "connected") return "Connected";
  if (status === "connecting") return "Connecting";
  if (status === "error") return "Connection error";
  return "Disconnected";
}

export function PlayerCameraClient({ token, player }: PlayerCameraClientProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const streamRef = useRef<MediaStream | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [status, setStatus] = useState<CameraStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void navigator.mediaDevices?.enumerateDevices().then((items) => {
      setDevices(items.filter((item) => item.kind === "videoinput"));
    });
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.srcObject = stream;
      if (stream) void previewRef.current.play().catch(() => undefined);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      closePeers(peersRef.current);
      stopStream(streamRef.current);
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
    };
  }, []);

  async function connectPublisher(mediaStream: MediaStream) {
    socketRef.current?.disconnect();
    closePeers(peersRef.current);

    const signalingUrl = getCamsSignalingUrl();
    if (!signalingUrl) {
      setStatus("error");
      setError("NEXT_PUBLIC_CAMS_SIGNALING_URL is not configured.");
      return;
    }

    const iceServers = await getIceServers();
    const socket = io(signalingUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connecting");
      socket.emit("publisher:join", { token });
    });

    socket.on("publisher:ready", () => {
      setStatus("camera-active");
      setError(null);
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = window.setInterval(() => socket.emit("publisher:heartbeat"), 12000);
    });

    socket.on("publisher:error", (payload: SignalPayload) => {
      setStatus("error");
      setError(payload.error || "Signaling rejected this camera session.");
    });

    socket.on("publisher:kick", () => {
      setStatus("disconnected");
      setError("This camera was opened in another browser tab.");
      socket.disconnect();
    });

    socket.on("viewer:join", async (payload: SignalPayload) => {
      const viewerId = payload.viewerId;
      if (!viewerId) return;

      const peer = new RTCPeerConnection({ iceServers });
      peersRef.current.set(viewerId, peer);

      mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc:ice-candidate", {
            target: viewerId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "closed" || peer.connectionState === "failed" || peer.connectionState === "disconnected") {
          peer.close();
          peersRef.current.delete(viewerId);
        }
      };

      const offer = await peer.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });
      await peer.setLocalDescription(offer);
      socket.emit("webrtc:offer", {
        target: viewerId,
        sdp: peer.localDescription
      });
    });

    socket.on("webrtc:answer", async (payload: SignalPayload) => {
      const viewerId = payload.from;
      if (!viewerId || !payload.sdp) return;
      await peersRef.current.get(viewerId)?.setRemoteDescription(payload.sdp).catch(() => undefined);
    });

    socket.on("webrtc:ice-candidate", async (payload: SignalPayload) => {
      const viewerId = payload.from;
      if (!viewerId || !payload.candidate) return;
      await peersRef.current.get(viewerId)?.addIceCandidate(payload.candidate).catch(() => undefined);
    });

    socket.on("viewer:left", (payload: SignalPayload) => {
      const viewerId = payload.viewerId;
      if (!viewerId) return;
      peersRef.current.get(viewerId)?.close();
      peersRef.current.delete(viewerId);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
      closePeers(peersRef.current);
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
    });

    socket.on("connect_error", () => {
      setStatus("error");
      setError("Cannot reach signaling server.");
    });
  }

  async function enableCamera(deviceId = selectedDeviceId, includeAudio = audioEnabled) {
    setError(null);
    setStatus("connecting");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30, max: 60 }
            }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30, max: 60 }
            },
        audio: includeAudio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          : false
      });

      stopStream(streamRef.current);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList.filter((item) => item.kind === "videoinput"));
      await connectPublisher(mediaStream);
    } catch (cameraError) {
      console.error(cameraError);
      setStatus("error");
      setError("Camera permission was denied or no camera was found.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <div className="aspect-video bg-black">
          <video ref={previewRef} muted playsInline autoPlay className="h-full w-full object-cover" />
        </div>
      </section>

      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/70">Camera uplink</div>
            <div className="mt-1 font-rajdhani text-2xl font-bold text-white">{player.nickname}</div>
          </div>
          <span className={`h-3 w-3 rounded-full ${status === "camera-active" ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.7)]" : status === "connecting" ? "bg-cyan-300" : "bg-red-300"}`} />
        </div>

        <div className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Team</span>
            <span className="truncate font-bold">{player.team_name || "No team"}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">SteamID64</span>
            <span className="font-rajdhani font-bold text-cyan-100">{player.steamid64}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Status</span>
            <span className="font-bold">{statusLabel(status)}</span>
          </div>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-300">
          <span>Camera</span>
          <select
            value={selectedDeviceId}
            onChange={(event) => {
              setSelectedDeviceId(event.target.value);
              if (stream) void enableCamera(event.target.value, audioEnabled);
            }}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-cyan-300"
          >
            <option value="">Default camera</option>
            {devices.map((device, index) => (
              <option key={device.deviceId || index} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-semibold text-slate-300">
          <span>Enable microphone for OBS</span>
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(event) => {
              setAudioEnabled(event.target.checked);
              if (stream) void enableCamera(selectedDeviceId, event.target.checked);
            }}
            className="h-5 w-5 accent-cyan-300"
          />
        </label>

        <button
          type="button"
          onClick={() => void enableCamera()}
          className="mt-4 w-full rounded-lg bg-cyan-300 px-4 py-3 font-rajdhani text-lg font-bold uppercase tracking-wide text-black transition hover:bg-emerald-300"
        >
          Enable camera
        </button>

        {error ? <p className="mt-3 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
      </aside>
    </div>
  );
}
