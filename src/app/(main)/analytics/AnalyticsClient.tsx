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
      <div className="relative mx-auto min-h-[80vh] max-w-6xl overflow-hidden p-6">
        {/* Header - Fade out */}
        <div className="flex items-center justify-between opacity-40">
          <div>
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Analytics & Insights
            </h1>
            <p className="mt-1 text-neutral-600">
              Discover patterns and insights from your memories
            </p>
          </div>
          <div className="pointer-events-none w-48 opacity-50">
            <Select options={timeRangeOptions} value={timeRange} onChange={() => {}} />
          </div>
        </div>

        {/* Blurred background content */}
        <div className="pointer-events-none mt-8 opacity-30 blur-md grayscale-[0.5] transition-all duration-1000 select-none">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total memories" value="0" icon={Calendar} />
            <StatCard title="This Month" value="0" icon={TrendUp} />
            <StatCard title="Weekly Average" value="0" icon={ChartBar} />
            <StatCard title="Longest Streak" value="0 days" icon={Clock} />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="h-72 bg-white">{null}</Card>
            <Card className="h-72 bg-white">{null}</Card>
          </div>
        </div>

        {/* Glassmorphic Overlay CTA */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-in fade-in zoom-in group relative duration-700">
            {/* Glowing background */}
            <div className="from-primary-400 via-secondary-400 to-primary-600 absolute -inset-1 rounded-[3rem] bg-linear-to-r opacity-20 blur-2xl transition-all duration-1000 group-hover:opacity-40 group-hover:blur-3xl" />

            <Card className="relative flex max-w-lg flex-col items-center justify-center space-y-6 rounded-3xl border border-white/50 bg-white/70 p-10 shadow-2xl backdrop-blur-2xl">
              <div className="from-primary-50 to-secondary-50 mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-white bg-linear-to-br shadow-inner">
                <ChartBar weight="duotone" className="text-primary-600 h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
                  Awaiting Your First Story
                </h1>
                <p className="mx-auto text-sm leading-relaxed text-neutral-600">
                  Your personal growth, mood patterns, and emotional rhythms will unlock here once
                  you start capturing moments in your timeline.
                </p>
              </div>
              <div className="w-full pt-4">
                <Button
                  variant="primary"
                  onClick={() => router.push("/timeline")}
                  className="shadow-primary-900/20 h-14 w-full rounded-2xl text-base shadow-xl transition-all active:scale-95"
                >
                  Start Your Archive
                </Button>
              </div>
            </Card>
          </div>
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
              data={analytics.topMoods.map(
                (m: { mood: string; percentage: number; count: number }) => ({
                  mood: m.mood,
                  percentage: m.percentage,
                  count: m.count,
                }),
              )}
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
