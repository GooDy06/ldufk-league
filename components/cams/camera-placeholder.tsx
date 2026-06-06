"use client";

import { getInitials } from "@/lib/cams/client";

type CameraPlaceholderProps = {
  nickname?: string | null;
  teamName?: string | null;
  avatarUrl?: string | null;
  compact?: boolean;
};

export function CameraPlaceholder({ nickname, teamName, avatarUrl, compact }: CameraPlaceholderProps) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(0,213,255,0.14),transparent_36%),linear-gradient(135deg,#07101a,#0b1420_52%,#02050a)]">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-50 grayscale" />
      ) : (
        <div className="grid h-20 w-20 place-items-center rounded-lg border border-cyan-300/20 bg-white/5 font-rajdhani text-3xl font-bold text-cyan-100">
          {getInitials(nickname)}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      {!compact ? (
        <div className="absolute bottom-3 left-3 right-3 min-w-0">
          <div className="truncate font-rajdhani text-lg font-bold leading-none text-white">{nickname || "NO CAMERA"}</div>
          <div className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">{teamName || "offline"}</div>
        </div>
      ) : null}
    </div>
  );
}
