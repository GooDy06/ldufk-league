import { randomBytes } from "crypto";
import type { CameraPlayer, CameraPlayerWithRoom, PublicCameraPlayer } from "@/lib/cams/types";

export function generateJoinToken() {
  return randomBytes(24).toString("base64url");
}

export function normalizeSteamId64(value: unknown) {
  const steamid = String(value || "").trim();
  return /^\d{17}$/.test(steamid) ? steamid : null;
}

export function publicCameraPlayer(player: CameraPlayerWithRoom | CameraPlayer | null): PublicCameraPlayer | null {
  if (!player) return null;

  const { join_token: _joinToken, ...safePlayer } = player as CameraPlayerWithRoom;
  return {
    ...safePlayer,
    is_online: isFreshOnline(safePlayer.is_online, safePlayer.last_seen)
  };
}

export function isFreshOnline(isOnline: boolean, lastSeen?: string | null) {
  if (!isOnline || !lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 45_000;
}

export function initials(name?: string | null) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "??";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getCamsBaseUrl(host?: string | null, protocol = "https") {
  const configured = process.env.NEXT_PUBLIC_CAMS_ORIGIN?.replace(/\/$/, "");
  if (configured) return configured;

  const cleanHost = String(host || "").toLowerCase();
  if (cleanHost.includes("localhost") || cleanHost.startsWith("127.0.0.1")) {
    return `http://${host}/cams`;
  }

  if (cleanHost.startsWith("cams.")) {
    return `${protocol}://${host}`;
  }

  return "https://cams.ldufk.com";
}
