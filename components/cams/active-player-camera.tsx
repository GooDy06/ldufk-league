"use client";

import { useEffect, useMemo, useState } from "react";
import { CameraViewer } from "@/components/cams/camera-viewer";
import { normalizeSteamId64Client } from "@/lib/cams/client";
import type { CameraStatus, PublicCameraPlayer } from "@/lib/cams/types";

type ActivePlayerCameraProps = {
  steamid?: string | null;
  mode?: "cover" | "contain";
  rounded?: boolean;
  muted?: boolean;
  className?: string;
  fallbackPlayer?: Partial<PublicCameraPlayer> | null;
  onStatusChange?: (status: CameraStatus) => void;
};

export function ActivePlayerCamera({
  steamid,
  mode = "cover",
  rounded = true,
  muted = true,
  className = "",
  fallbackPlayer,
  onStatusChange
}: ActivePlayerCameraProps) {
  const normalizedSteamId = useMemo(() => normalizeSteamId64Client(steamid), [steamid]);
  const [displayedSteamId, setDisplayedSteamId] = useState(normalizedSteamId);
  const [visible, setVisible] = useState(true);
  const [player, setPlayer] = useState<Partial<PublicCameraPlayer> | null>(fallbackPlayer || null);

  useEffect(() => {
    if (normalizedSteamId === displayedSteamId) return;

    setVisible(false);
    const timer = window.setTimeout(() => {
      setDisplayedSteamId(normalizedSteamId);
      setVisible(true);
    }, 170);

    return () => window.clearTimeout(timer);
  }, [displayedSteamId, normalizedSteamId]);

  useEffect(() => {
    if (!displayedSteamId) {
      setPlayer(fallbackPlayer || null);
      return;
    }

    let cancelled = false;
    const steamidToLoad = displayedSteamId;

    async function loadPlayer() {
      const response = await fetch(`/api/cams/player?steamid=${encodeURIComponent(steamidToLoad)}`, { cache: "no-store" }).catch(() => null);
      if (!response?.ok || cancelled) return;
      const data = (await response.json()) as { player: PublicCameraPlayer | null };
      if (!cancelled) {
        setPlayer(data.player || fallbackPlayer || null);
      }
    }

    void loadPlayer();

    return () => {
      cancelled = true;
    };
  }, [displayedSteamId, fallbackPlayer]);

  return (
    <div className={`relative aspect-video overflow-hidden bg-black/40 ${rounded ? "rounded-lg" : ""} ${className}`}>
      <div className={`absolute inset-0 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
        <CameraViewer
          key={displayedSteamId || "no-player"}
          steamid={displayedSteamId}
          mode={mode}
          rounded={rounded}
          muted={muted}
          showFallback
          fallbackPlayer={player}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
