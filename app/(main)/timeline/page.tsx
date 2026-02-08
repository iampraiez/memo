import React from "react";
import TimelineClient from "./TimelineClient";
import { getTimelineMemories } from "@/lib/timeline-ssr";

export default async function TimelinePage() {
  const initialMemories = await getTimelineMemories() || [];

  return (
    <TimelineClient initialMemories={initialMemories} />
  );
}
