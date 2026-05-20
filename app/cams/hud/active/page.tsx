import { ActivePlayerCamera } from "@/components/cams/active-player-camera";

export const dynamic = "force-dynamic";

type HudSearchParams = {
  steamid?: string;
  mode?: "cover" | "contain";
  rounded?: string;
  muted?: string;
  nickname?: string;
  avatar?: string;
  delay?: string;
};

function bool(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

function delaySeconds(value: string | undefined) {
  const delay = Number(value || 0);
  if (!Number.isFinite(delay)) return 0;
  return Math.max(0, Math.min(900, Math.floor(delay)));
}

export default function ActiveHudCameraPage({ searchParams }: { searchParams: HudSearchParams }) {
  const mode = searchParams.mode === "contain" ? "contain" : "cover";
  const rounded = bool(searchParams.rounded, true);
  const muted = bool(searchParams.muted, true);
  const delay = delaySeconds(searchParams.delay);

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <ActivePlayerCamera
        steamid={searchParams.steamid}
        mode={mode}
        rounded={rounded}
        muted={muted}
        delaySeconds={delay}
        className="h-full w-full"
        fallbackPlayer={{
          nickname: searchParams.nickname || "Player",
          avatar_url: searchParams.avatar || null
        }}
      />
    </div>
  );
}
