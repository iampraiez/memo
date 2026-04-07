import { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import AnalyticsClient from "./AnalyticsClient";
import { getAnalyticsData } from "@/lib/analytics-ssr";

async function AnalyticsContent() {
  const initialAnalytics = await getAnalyticsData("year");
  return <AnalyticsClient initialAnalytics={initialAnalytics} />;
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<Loading fullPage text="Synthesizing sanctuary data..." />}>
      <AnalyticsContent />
    </Suspense>
  );
}
