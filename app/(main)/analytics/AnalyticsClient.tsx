"use client";
import React, { useState } from "react";
import {
  TrendUp,
  Calendar,
  Heart,
  Tag as TagIcon,
  Clock,
  ChartBar,
} from "@phosphor-icons/react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Select from "@/components/ui/Select";
import { useAnalytics } from "@/hooks/useAnalytics";
import Loading from "@/components/ui/Loading";
import { Analytics } from "@/types/types";
import ActivityChart from "@/components/analytics/ActivityChart";
import MoodChart from "@/components/analytics/MoodChart";
import WeeklyPatternChart from "@/components/analytics/WeeklyPatternChart";

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">Analytics & Insights</h1>
          <p className="text-neutral-600 mt-1">Discover patterns and insights from your memories</p>
        </div>
        <div className="w-48">
          <Select options={timeRangeOptions} value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total memories" value={analytics.totalMemories.toLocaleString()} icon={Calendar} />
        <StatCard title="This Month" value={analytics.memoriesThisMonth.toString()} icon={TrendUp} />
        <StatCard title="Weekly Average" value={analytics.averagePerWeek.toString()} icon={ChartBar} />
        <StatCard title="Longest Streak" value={`${analytics.longestStreak} days`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-neutral-900">Activity Patterns</h2>
          <div className="w-full">
              <ActivityChart data={analytics.monthlyActivity} />
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-neutral-900">Emotional Balance</h2>
           <div className="w-full flex justify-center">
              <MoodChart 
                data={analytics.topMoods.map(m => ({
                    mood: m.mood,
                    percentage: m.percentage,
                    count: m.count
                }))} 
              />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6">
              <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-900" />
                  Weekly Rhythm
              </h2>
              <div className="w-full">
                  <WeeklyPatternChart data={analytics.weeklyPattern} />
              </div>
          </Card>

          <Card className="p-8 space-y-6">
              <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2 text-primary-900" />
                  Relationship Clusters
              </h2>
              <p className="text-sm text-neutral-500">Discover which aspects of your life are most connected.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analytics.tagClusters?.map((cluster: any) => (
                      <div key={cluster.tag} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                          <p className="font-bold text-neutral-900 capitalize text-sm">{cluster.tag}</p>
                          <div className="flex flex-wrap gap-1.5">
                              {cluster.related.map((rel: any) => (
                                  <span key={rel.name} className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-neutral-500 border border-neutral-100">
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
          <Card className="p-8 space-y-6 flex flex-col justify-center bg-gradient-to-br from-white to-neutral-50">
              <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-900 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <TrendUp className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-neutral-900">Personal Growth</h2>
                  <p className="text-neutral-600 max-w-sm mx-auto">
                      You've maintained a <strong>{analytics.longestStreak} day</strong> streak of capturing life. This consistency builds a rich foundation for AI-driven heritage narratives.
                  </p>
                  <div className="pt-4">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary-400 rounded-full text-primary-900 font-bold text-sm">
                          <span>Keep it going!</span>
                      </div>
                  </div>
              </div>
          </Card>
      </div>

      <Card className="bg-primary-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-[100px] -mr-32 -mb-32" />
        <div className="flex items-start space-x-6">
            <div className="w-14 h-14 bg-secondary-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
                <TrendUp className="w-8 h-8 text-primary-900" />
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-display font-bold italic">AI Sanctuary Insight</h3>
                <p className="text-lg text-primary-50 font-light leading-relaxed max-w-2xl">
                    "Your most vibrant memories are often captured during travel. We've noticed a significant increase in grateful reflections this month—keep preserving these precious highlights."
                </p>
            </div>
        </div>
      </Card>
    </div>
  );
}
