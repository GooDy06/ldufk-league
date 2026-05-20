"use client";

import { CameraViewer } from "@/components/cams/camera-viewer";
import type { PublicCameraPlayer } from "@/lib/cams/types";

type RoomCameraGridProps = {
  players: PublicCameraPlayer[];
  mode?: "cover" | "contain";
  rounded?: boolean;
  showNames?: boolean;
  delaySeconds?: number;
};

function gridClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count <= 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-3";
  return "grid-cols-5";
}

export function RoomCameraGrid({ players, mode = "cover", rounded = true, showNames = true, delaySeconds = 0 }: RoomCameraGridProps) {
  return (
    <div className={`grid h-screen w-screen gap-2 bg-transparent p-2 ${gridClass(players.length)}`}>
      {players.map((player) => (
        <div key={player.id} className={`relative min-h-0 overflow-hidden bg-black/50 ${rounded ? "rounded-lg" : ""}`}>
          <CameraViewer
            steamid={player.steamid64}
            mode={mode}
            rounded={rounded}
            muted
            delaySeconds={delaySeconds}
            showFallback
            fallbackPlayer={player}
            clean={!showNames}
            className="h-full w-full"
          />
          {showNames ? (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="truncate font-rajdhani text-lg font-bold leading-none text-white">{player.nickname}</div>
              <div className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100/75">{player.team_name || "No team"}</div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
