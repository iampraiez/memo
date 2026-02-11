import { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import FriendsClient from "./FriendsClient";
import { getSocialTimeline } from "@/lib/social-ssr";

async function FriendsContent() {
  const initialMemories = await getSocialTimeline() || [];
  return <FriendsClient initialMemories={initialMemories} />;
}

export default function FamilyTimelinePage() {
  return (
    <Suspense fallback={<Loading fullPage text="Connecting to your sanctuary circle..." />}>
      <FriendsContent />
    </Suspense>
  );
}
