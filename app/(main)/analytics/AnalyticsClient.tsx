"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendUp, Calendar, Tag as TagIcon, Clock, ChartBar } from "@phosphor-icons/react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useAnalytics } from "@/hooks/useAnalytics";
import Loading from "@/components/ui/Loading";
import { Analytics } from "@/types/types";
import ActivityChart from "@/components/analytics/ActivityChart";
import MoodChart from "@/components/analytics/MoodChart";
import WeeklyPatternChart from "@/components/analytics/WeeklyPatternChart";
import InsightCarousel from "@/components/analytics/InsightCarousel";

const timeRangeOptions = [
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "year", label: "Last Year" },
];

interface AnalyticsClientProps {
  initialAnalytics: Analytics | null;
}

export default function AnalyticsClient({ initialAnalytics }: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState("year");
  const router = useRouter();
  const { data: analyticsData, isLoading, error } = useAnalytics(timeRange);

  // Use initial data if available and timeRange matches default (year), otherwise use fetched data
  // thorough implementation would check if initial data matches the current timeRange
  // For now, we'll rely on the hook which will hydrate or fetch.
  // Ideally, useQuery initialData could be used if we passed the range down.

  const analytics = analyticsData || initialAnalytics;

  if (isLoading && !analytics) {
    return <Loading fullPage text="Decrypting emotional patterns..." />;
  }

  if (error && !analytics) {
    return null;
  }

  if (!analytics) return null;

  if (analytics.totalMemories === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center space-y-8 p-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-neutral-100 bg-neutral-50 shadow-inner">
          <ChartBar className="h-12 w-12 text-neutral-300" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
          Your Sanctuary is Quiet
        </h1>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-neutral-500">
          Your personal growth and emotional patterns will bloom here once you start capturing your
          memories.
        </p>
        <div className="pt-8">
          <Button
            variant="primary"
            onClick={() => router.push("/timeline")}
            className="shadow-primary-900/20 h-12 rounded-2xl px-8 shadow-lg"
          >
            Start Your Archive
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Analytics & Insights</h1>
          <p className="mt-1 text-neutral-600">Discover patterns and insights from your memories</p>
        </div>
        <div className="w-48">
          <Select options={timeRangeOptions} value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total memories"
          value={analytics.totalMemories.toLocaleString()}
          icon={Calendar}
        />
        <StatCard
          title="This Month"
          value={analytics.memoriesThisMonth.toString()}
          icon={TrendUp}
        />
        <StatCard
          title="Weekly Average"
          value={analytics.averagePerWeek.toString()}
          icon={ChartBar}
        />
        <StatCard title="Longest Streak" value={`${analytics.longestStreak} days`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="space-y-6 p-8">
          <h2 className="font-display text-xl font-bold text-neutral-900">Activity Patterns</h2>
          <div className="w-full">
            <ActivityChart data={analytics.monthlyActivity} />
          </div>
        </Card>

        <Card className="space-y-6 p-8">
          <h2 className="font-display text-xl font-bold text-neutral-900">Emotional Balance</h2>
          <div className="flex w-full justify-center">
            <MoodChart
              data={analytics.topMoods.map((m) => ({
                mood: m.mood,
                percentage: m.percentage,
                count: m.count,
              }))}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="space-y-6 p-8">
          <h2 className="font-display flex items-center text-xl font-bold text-neutral-900">
            <Clock className="text-primary-900 mr-2 h-5 w-5" />
            Weekly Rhythm
          </h2>
          <div className="w-full">
            <WeeklyPatternChart data={analytics.weeklyPattern} />
          </div>
        </Card>

        <Card className="space-y-6 p-8">
          <h2 className="font-display flex items-center text-xl font-bold text-neutral-900">
            <TagIcon className="text-primary-900 mr-2 h-5 w-5" />
            Relationship Clusters
          </h2>
          <p className="text-sm text-neutral-500">
            Discover which aspects of your life are most connected.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {analytics.tagClusters?.map((cluster: { tag: string; related: { name: string }[] }) => (
              <div
                key={cluster.tag}
                className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
              >
                <p className="text-sm font-bold text-neutral-900 capitalize">{cluster.tag}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cluster.related.map((rel) => (
                    <span
                      key={rel.name}
                      className="rounded-full border border-neutral-100 bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-500"
                    >
                      {rel.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="flex flex-col justify-center space-y-6 bg-linear-to-br from-white to-neutral-50 p-8">
          <div className="space-y-4 text-center">
            <div className="bg-primary-900 mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
              <TrendUp className="text-secondary-400 h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-neutral-900">Personal Growth</h2>
            <p className="mx-auto max-w-sm text-neutral-600">
              You've maintained a <strong>{analytics.longestStreak} day</strong> streak of capturing
              life. This consistency builds a rich foundation for AI-driven heritage narratives.
            </p>
            <div className="pt-4">
              <div className="bg-secondary-400 text-primary-900 inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-bold">
                <span>Keep it going!</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <InsightCarousel />
    </div>
  );
}
