import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import { createClient } from "@supabase/supabase-js";
import { Server, type Socket } from "socket.io";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env.local"), override: false });

type CameraRoom = {
  id: string;
  name: string;
  tournament_name: string | null;
  created_at: string;
};

type CameraPlayer = {
  id: string;
  room_id: string;
  nickname: string;
  team_name: string | null;
  steamid64: string;
  avatar_url: string | null;
  join_token: string;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
  room?: CameraRoom | null;
};

type SignalPayload = {
  token?: string;
  steamid?: string;
  target?: string;
  sdp?: unknown;
  candidate?: unknown;
};

type ViewerBinding = {
  playerId: string;
  publisherSocketId: string | null;
};

const port = Number(process.env.PORT || 4000);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the signaling server.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const allowedOrigins = String(process.env.CAMS_ALLOWED_ORIGINS || "http://localhost:3000,https://cams.ldufk.com,https://ldufk.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin || undefined));
    }
  })
);

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "ldufk-cams-signaling" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin || undefined));
    },
    methods: ["GET", "POST"]
  }
});

const publishers = new Map<string, string>();
const viewers = new Map<string, ViewerBinding>();

function cameraViewersRoom(playerId: string) {
  return `camera:${playerId}:viewers`;
}

function normalizeSteamId64(value: unknown) {
  const steamid = String(value || "").trim();
  return /^\d{17}$/.test(steamid) ? steamid : null;
}

function publicPlayer(player: CameraPlayer) {
  const { join_token: _joinToken, ...safePlayer } = player;
  return safePlayer;
}

async function findPlayerByToken(token: string) {
  const { data, error } = await supabase
    .from("camera_players")
    .select("*, room:camera_rooms(id,name,tournament_name,created_at)")
    .eq("join_token", token)
    .maybeSingle();

  if (error) throw error;
  return data as CameraPlayer | null;
}

async function findPlayerBySteamId(steamid64: string) {
  const { data, error } = await supabase
    .from("camera_players")
    .select("*, room:camera_rooms(id,name,tournament_name,created_at)")
    .eq("steamid64", steamid64)
    .order("is_online", { ascending: false })
    .order("last_seen", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as CameraPlayer | null;
}

async function markPlayerOnline(playerId: string, peerId: string) {
  const now = new Date().toISOString();
  await supabase
    .from("camera_players")
    .update({
      is_online: true,
      last_seen: now
    })
    .eq("id", playerId);

  const { data } = await supabase
    .from("camera_sessions")
    .insert({
      player_id: playerId,
      peer_id: peerId,
      status: "online",
      updated_at: now
    })
    .select("id")
    .maybeSingle();

  return data?.id as string | undefined;
}

async function markPlayerOffline(playerId: string, sessionId?: string) {
  const now = new Date().toISOString();
  await supabase
    .from("camera_players")
    .update({
      is_online: false,
      last_seen: now
    })
    .eq("id", playerId);

  if (sessionId) {
    await supabase
      .from("camera_sessions")
      .update({
        status: "ended",
        updated_at: now
      })
      .eq("id", sessionId);
  }
}

async function touchPlayer(playerId: string, sessionId?: string) {
  const now = new Date().toISOString();
  await supabase
    .from("camera_players")
    .update({
      is_online: true,
      last_seen: now
    })
    .eq("id", playerId);

  if (sessionId) {
    await supabase
      .from("camera_sessions")
      .update({
        status: "active",
        updated_at: now
      })
      .eq("id", sessionId);
  }
}

async function isSessionRemoved(sessionId?: string) {
  if (!sessionId) return false;

  const { data, error } = await supabase.from("camera_sessions").select("status").eq("id", sessionId).maybeSingle();
  if (error) throw error;
  return data?.status === "removed";
}

function canRelay(socket: Socket, target: string) {
  if (socket.data.role === "publisher") {
    const viewer = viewers.get(target);
    return Boolean(viewer && viewer.playerId === socket.data.playerId && viewer.publisherSocketId === socket.id);
  }

  if (socket.data.role === "viewer") {
    const viewer = viewers.get(socket.id);
    return Boolean(viewer && viewer.publisherSocketId === target);
  }

  return false;
}

function relay(socket: Socket, event: "webrtc:offer" | "webrtc:answer" | "webrtc:ice-candidate", payload: SignalPayload) {
  const target = String(payload?.target || "");
  if (!target || !canRelay(socket, target)) return;
  io.to(target).emit(event, {
    ...payload,
    from: socket.id
  });
}

function inviteWaitingViewers(playerId: string, publisherSocketId: string) {
  const room = io.sockets.adapter.rooms.get(cameraViewersRoom(playerId));
  if (!room) return;

  for (const viewerId of room) {
    const viewerSocket = io.sockets.sockets.get(viewerId);
    if (!viewerSocket || viewerSocket.id === publisherSocketId) continue;
    viewers.set(viewerId, { playerId, publisherSocketId });
    io.to(publisherSocketId).emit("viewer:join", { viewerId });
  }
}

io.on("connection", (socket) => {
  socket.on("publisher:join", async (payload: SignalPayload) => {
    try {
      const token = String(payload?.token || "").trim();
      if (!token) {
        socket.emit("publisher:error", { error: "Missing join token." });
        return;
      }

      const player = await findPlayerByToken(token);
      if (!player) {
        socket.emit("publisher:error", { error: "Invalid or expired join token." });
        return;
      }

      const previousSocketId = publishers.get(player.id);
      if (previousSocketId && previousSocketId !== socket.id) {
        io.to(previousSocketId).emit("publisher:kick");
        io.sockets.sockets.get(previousSocketId)?.disconnect(true);
      }

      publishers.set(player.id, socket.id);
      socket.data.role = "publisher";
      socket.data.playerId = player.id;
      socket.data.steamid64 = player.steamid64;
      socket.data.sessionId = await markPlayerOnline(player.id, socket.id);

      socket.emit("publisher:ready", { player: publicPlayer({ ...player, is_online: true, last_seen: new Date().toISOString() }) });
      io.to(cameraViewersRoom(player.id)).emit("camera:online", { player: publicPlayer(player) });
      inviteWaitingViewers(player.id, socket.id);
    } catch (error) {
      console.error("publisher:join failed", error);
      socket.emit("publisher:error", { error: "Could not start camera session." });
    }
  });

  socket.on("publisher:heartbeat", async () => {
    if (socket.data.role !== "publisher" || !socket.data.playerId) return;
    if (publishers.get(socket.data.playerId) !== socket.id) return;

    try {
      if (await isSessionRemoved(socket.data.sessionId)) {
        socket.emit("publisher:kick");
        socket.disconnect(true);
        return;
      }

      await touchPlayer(socket.data.playerId, socket.data.sessionId);
    } catch (error) {
      console.error("heartbeat failed", error);
    }
  });

  socket.on("viewer:join", async (payload: SignalPayload) => {
    try {
      const steamid64 = normalizeSteamId64(payload?.steamid);
      if (!steamid64) {
        socket.emit("camera:offline", { reason: "invalid-steamid" });
        return;
      }

      const player = await findPlayerBySteamId(steamid64);
      if (!player) {
        socket.emit("camera:offline", { reason: "not-found" });
        return;
      }

      const publisherSocketId = publishers.get(player.id) || null;
      socket.data.role = "viewer";
      socket.data.playerId = player.id;
      socket.join(cameraViewersRoom(player.id));

      viewers.set(socket.id, {
        playerId: player.id,
        publisherSocketId
      });

      socket.emit("viewer:ready", { player: publicPlayer(player) });

      if (!publisherSocketId) {
        socket.emit("camera:offline", { player: publicPlayer(player), reason: "publisher-offline" });
        return;
      }

      io.to(publisherSocketId).emit("viewer:join", { viewerId: socket.id });
    } catch (error) {
      console.error("viewer:join failed", error);
      socket.emit("camera:offline", { reason: "lookup-error" });
    }
  });

  socket.on("webrtc:offer", (payload: SignalPayload) => relay(socket, "webrtc:offer", payload));
  socket.on("webrtc:answer", (payload: SignalPayload) => relay(socket, "webrtc:answer", payload));
  socket.on("webrtc:ice-candidate", (payload: SignalPayload) => relay(socket, "webrtc:ice-candidate", payload));

  socket.on("disconnect", async () => {
    if (socket.data.role === "publisher" && socket.data.playerId) {
      const playerId = String(socket.data.playerId);
      if (publishers.get(playerId) === socket.id) {
        publishers.delete(playerId);
        await markPlayerOffline(playerId, socket.data.sessionId).catch((error) => console.error("offline update failed", error));
        io.to(cameraViewersRoom(playerId)).emit("camera:offline", { reason: "publisher-disconnected" });
      }
    }

    if (socket.data.role === "viewer") {
      const binding = viewers.get(socket.id);
      viewers.delete(socket.id);
      if (binding?.publisherSocketId) {
        io.to(binding.publisherSocketId).emit("viewer:left", { viewerId: socket.id });
      }
    }
  });
});

server.listen(port, () => {
  console.log(`LDUFK cams signaling server listening on :${port}`);
});
