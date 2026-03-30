import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { Analytics } from "@/types/types";
import {
  format,
  subDays,
  startOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";

export async function getAnalyticsData(timeRange: string = "year") {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "week":
      startDate = subDays(now, 7);
      break;
    case "month":
      startDate = subDays(now, 30);
      break;
    case "year":
      startDate = startOfMonth(subDays(now, 365));
      break;
    case "all":
    default:
      startDate = new Date(1970, 0, 1);
      break;
  }

  const userMemories = await db.query.memories.findMany({
    where: and(
      eq(memories.userId, session.user.id),
      gte(memories.date, startDate),
      lte(memories.date, now),
    ),
    with: {
      memoryTags: { with: { tag: true } },
    },
  });

  const totalMemories = userMemories.length;

  // memoriesThisMonth is always for the current calendar month
  const monthStart = startOfMonth(now);
  const memoriesThisMonth = userMemories.filter((m) => m.date >= monthStart).length;

  const diffDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const averagePerWeek = parseFloat(((totalMemories / diffDays) * 7).toFixed(1));

  // Mood Distribution
  const moodCounts: Record<string, number> = {};
  userMemories.forEach((m) => {
    if (m.mood) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });

  const topMoods = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: totalMemories > 0 ? Math.round((count / totalMemories) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Activity Pattern (Dynamic Buckets)
  let activityData: { label: string; count: number }[] = [];
  if (timeRange === "week" || timeRange === "month") {
    const days = eachDayOfInterval({ start: startDate, end: now });
    activityData = days.map((day) => {
      const count = userMemories.filter((m) => isSameDay(m.date, day)).length;
      return { label: format(day, "MMM dd"), count };
    });
  } else {
    const months = eachMonthOfInterval({ start: startDate, end: now });
    activityData = months.map((month) => {
      const count = userMemories.filter((m) => isSameMonth(m.date, month)).length;
      return { label: format(month, "MMM"), count };
    });
  }

  // Weekly Rhythm (Day of Week Distribution)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyCounts: Record<string, number> = {};
  dayNames.forEach((day) => (weeklyCounts[day] = 0));
  userMemories.forEach((m) => {
    const day = dayNames[m.date.getDay()];
    weeklyCounts[day]++;
  });
  const weeklyPattern = dayNames.map((day) => ({ day, memories: weeklyCounts[day] }));

  // Streak calculation
  const sortedDates = Array.from(
    new Set(userMemories.map((m) => format(m.date, "yyyy-MM-dd"))),
  ).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let prevDate: Date | null = null;

  sortedDates.forEach((dateStr) => {
    const currentDate = new Date(dateStr);
    if (prevDate) {
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    prevDate = currentDate;
  });
  longestStreak = Math.max(longestStreak, currentStreak);

  // Tag Relationships
  const tagCooccurrence: Record<string, Record<string, number>> = {};
  userMemories.forEach((m) => {
    const tags = m.memoryTags.map((t) => t.tag.name);
    tags.forEach((t1) => {
      if (!tagCooccurrence[t1]) tagCooccurrence[t1] = {};
      tags.forEach((t2) => {
        if (t1 !== t2) tagCooccurrence[t1][t2] = (tagCooccurrence[t1][t2] || 0) + 1;
      });
    });
  });

  const tagClusters = Object.entries(tagCooccurrence)
    .map(([tag, relations]) => ({
      tag,
      related: Object.entries(relations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count })),
    }))
    .sort((a, b) => b.related.length - a.related.length)
    .slice(0, 6);

  return {
    totalMemories,
    memoriesThisMonth,
    averagePerWeek,
    longestStreak,
    topMoods,
    topTags: [],
    monthlyActivity: activityData,
    weeklyPattern,
    tagClusters,
  } as Analytics;
}
