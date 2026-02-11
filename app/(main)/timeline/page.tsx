import { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import TimelineClient from "./TimelineClient";
import { getTimelineMemories } from "@/lib/timeline-ssr";

async function TimelineContent() {
  const initialMemories = await getTimelineMemories() || [];
  return <TimelineClient initialMemories={initialMemories} />;
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<Loading fullPage text="Gathering your memories..." />}>
      <TimelineContent />
    </Suspense>
  );
}
