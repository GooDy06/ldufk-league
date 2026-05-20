import { CameraViewer } from "@/components/cams/camera-viewer";

export const dynamic = "force-dynamic";

type ViewerSearchParams = {
  mode?: "cover" | "contain";
  rounded?: string;
  muted?: string;
};

function bool(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export default function CameraViewPage({ params, searchParams }: { params: { steamid: string }; searchParams: ViewerSearchParams }) {
  const mode = searchParams.mode === "contain" ? "contain" : "cover";
  const rounded = bool(searchParams.rounded);
  const muted = bool(searchParams.muted, true);

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <CameraViewer steamid={params.steamid} mode={mode} rounded={rounded} muted={muted} clean showFallback={false} />
    </div>
  );
}
