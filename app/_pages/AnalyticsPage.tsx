import React, { useState } from "react";
import {
  TrendUp,
  Calendar,
  Heart,
  Tag as TagIcon,
  Clock,
  ChartBar,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Select from "@/components/ui/Select";
import { useAnalytics } from "@/hooks/useAnalytics";
import Button from "@/components/ui/Button";

const timeRangeOptions = [
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "quarter", label: "Last Quarter" },
  { value: "year", label: "Last Year" },
  { value: "all", label: "All Time" },
];

const moodColors = {
  joyful: "bg-yellow-100",
  peaceful: "bg-blue-100",
  excited: "bg-orange-100",
  nostalgic: "bg-purple-100",
  grateful: "bg-green-100",
  reflective: "bg-gray-100",
} as const;

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("year");
  const { data: analytics, isLoading, error, refetch } = useAnalytics(timeRange);

  if (isLoading) {
    return (
      <div className="min-h-fit bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-fit bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center p-6">
            <p className="text-destructive-600 mb-4">Failed to load analytics</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-fit bg-neutral-50">
      <div className="">
        <main className="">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-bold text-neutral-900">
                    Analytics & Insights
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    Discover patterns and insights from your memories
                  </p>
                </div>

                <div className="w-48">
                  <Select
                    options={timeRangeOptions}
                    value={timeRange}
                    onChange={setTimeRange}
                    placeholder="Select time range"
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Memories"
                  value={analytics.totalMemories.toLocaleString()}
                  icon={Calendar}
                  change={{ value: "+12%", trend: "up" }}
                />
                <StatCard
                  title="This Month"
                  value={analytics.memoriesThisMonth.toString()}
                  icon={TrendUp}
                  change={{ value: "+3", trend: "up" }}
                />
                <StatCard
                  title="Weekly Average"
                  value={analytics.averagePerWeek.toString()}
                  icon={ChartBar}
                  change={{ value: "+0.5", trend: "up" }}
                />
                <StatCard
                  title="Longest Streak"
                  value={`${analytics.longestStreak} days`}
                  icon={Clock}
                  change={{ value: "Personal best!", trend: "up" }}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Activity */}
                <Card>
                  <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Monthly Activity
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.monthlyActivity.map((month) => (
                        <div
                          key={month.month}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-8 text-sm text-neutral-600 font-medium">
                            {month.month}
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(month.memories / 35) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-8 text-sm text-neutral-900 font-medium text-right">
                            {month.memories}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Weekly Pattern */}
                <Card>
                  <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Weekly Pattern
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.weeklyPattern.map((day) => (
                        <div
                          key={day.day}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-8 text-sm text-neutral-600 font-medium">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className="bg-secondary-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(day.memories / 35) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-8 text-sm text-neutral-900 font-medium text-right">
                            {day.memories}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Insights Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Moods */}
                <Card>
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-primary-600" />
                      <h2 className="text-xl font-semibold text-neutral-900">
                        Top Moods
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.topMoods.map((mood) => (
                        <div
                          key={mood.mood}
                          className="flex items-center space-x-4"
                        >
                          <div
                            className={`w-4 h-4 rounded-full ${
                              moodColors[mood.mood as keyof typeof moodColors]
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-neutral-900 capitalize">
                                {mood.mood}
                              </span>
                              <span className="text-sm text-neutral-600">
                                {mood.count} ({mood.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  moodColors[
                                    mood.mood as keyof typeof moodColors
                                  ]
                                }`}
                                style={{ width: `${mood.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Top Tags */}
                <Card>
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <TagIcon className="w-5 h-5 text-primary-600" />
                      <h2 className="text-xl font-semibold text-neutral-900">
                        Top Tags
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.topTags.map((tag) => (
                        <div
                          key={tag.tag}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-4 h-4 rounded bg-primary-600" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-neutral-900">
                                {tag.tag}
                              </span>
                              <span className="text-sm text-neutral-600">
                                {tag.count} ({tag.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${tag.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Insights */}
              <Card className="bg-linear-to-r from-primary-50 to-secondary-50 border-primary-200">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shrink-0">
                      <TrendUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        AI Insights
                      </h3>
                      <div className="space-y-2 text-sm text-neutral-700">
                        <p>
                          • You&apos;re most active on weekends, with 63% more
                          memories created
                        </p>
                        <p>
                          • Your happiest memories often include the
                          &apos;family&apos; and &apos;travel&apos; tags
                        </p>
                        <p>
                          • You&apos;ve been consistently grateful this month -
                          40% of memories have a grateful mood
                        </p>
                        <p>
                          • Your memory creation has increased 23% compared to
                          last quarter
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
