import type { IceServerResponse } from "@/lib/cams/types";

export function normalizeSteamId64Client(value: unknown) {
  const steamid = String(value || "").trim();
  return /^\d{17}$/.test(steamid) ? steamid : null;
}

export function getCamsSignalingUrl() {
  const configured = process.env.NEXT_PUBLIC_CAMS_SIGNALING_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000";
    }
  }

  return "";
}

export async function getIceServers() {
  const response = await fetch("/api/cams/ice", { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as IceServerResponse;
  return data.iceServers || [];
}

export function getInitials(name?: string | null) {
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
