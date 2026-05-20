import { VetoObsOverlay } from "@/components/veto/veto-obs-overlay";

export const dynamic = "force-dynamic";

export default function VetoObsPage({ params }: { params: { sessionId: string } }) {
  return <VetoObsOverlay sessionId={params.sessionId} />;
}
