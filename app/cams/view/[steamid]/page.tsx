import { CameraViewer } from "@/components/cams/camera-viewer";

export const dynamic = "force-dynamic";

type ViewerSearchParams = {
  mode?: "cover" | "contain";
  rounded?: string;
  muted?: string;
  name?: string;
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

export default function CameraViewPage({ params, searchParams }: { params: { steamid: string }; searchParams: ViewerSearchParams }) {
  const mode = searchParams.mode === "contain" ? "contain" : "cover";
  const rounded = bool(searchParams.rounded);
  const muted = bool(searchParams.muted, true);
  const showName = bool(searchParams.name);
  const delay = delaySeconds(searchParams.delay);

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <CameraViewer steamid={params.steamid} mode={mode} rounded={rounded} muted={muted} delaySeconds={delay} clean showFallback={false} showNameOverlay={showName} />
    </div>
  );
}
