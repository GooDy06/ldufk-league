import { ActivePlayerCamera } from "@/components/cams/active-player-camera";

export const dynamic = "force-dynamic";

type HudSearchParams = {
  steamid?: string;
  mode?: "cover" | "contain";
  rounded?: string;
  muted?: string;
  nickname?: string;
  avatar?: string;
};

function bool(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export default function ActiveHudCameraPage({ searchParams }: { searchParams: HudSearchParams }) {
  const mode = searchParams.mode === "contain" ? "contain" : "cover";
  const rounded = bool(searchParams.rounded, true);
  const muted = bool(searchParams.muted, true);

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <ActivePlayerCamera
        steamid={searchParams.steamid}
        mode={mode}
        rounded={rounded}
        muted={muted}
        className="h-full w-full"
        fallbackPlayer={{
          nickname: searchParams.nickname || "Player",
          avatar_url: searchParams.avatar || null
        }}
      />
    </div>
  );
}
