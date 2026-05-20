import { VetoObsOverlay } from "@/components/veto/veto-obs-overlay";

export const dynamic = "force-dynamic";

export default function VetoObsPage({ params, searchParams }: { params: { sessionId: string }; searchParams: { layout?: string } }) {
  const layout = searchParams.layout === "compact" ? "compact" : "cards";

  return <VetoObsOverlay sessionId={params.sessionId} layout={layout} />;
}
