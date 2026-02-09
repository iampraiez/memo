import React from "react";
import FriendsClient from "./FriendsClient";
import { getSocialTimeline } from "@/lib/social-ssr";

export default async function FamilyTimelinePage() {
  const initialMemories = await getSocialTimeline() || [];

  return (
    <FriendsClient initialMemories={initialMemories} />
  );
}
