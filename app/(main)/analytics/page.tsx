import React from "react";
import AnalyticsClient from "./AnalyticsClient";
import { getAnalyticsData } from "@/lib/analytics-ssr";

export default async function AnalyticsPage() {
  const initialAnalytics = await getAnalyticsData("year");

  return (
    <AnalyticsClient initialAnalytics={initialAnalytics} />
  );
}
