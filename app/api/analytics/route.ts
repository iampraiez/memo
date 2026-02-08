import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "year";

    // Get user ID from email
    const [user] = await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        startDate.setFullYear(1970);
        break;
    }

    // Get memories for analysis
    const userMemories = await db.query.memories.findMany({
      where: and(
        eq(memories.userId, user.id),
        gte(memories.date, startDate),
        lte(memories.date, now),
      ),
      with: {
        memoryTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalMemories = userMemories.length;

    const memoriesThisMonth = userMemories.filter((memory) => {
      const memoryDate = new Date(memory.date);
      return (
        memoryDate.getMonth() === now.getMonth() &&
        memoryDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const weeksSinceStart = Math.max(
      1,
      Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
      ),
    );
    const averagePerWeek = parseFloat(
      (totalMemories / weeksSinceStart).toFixed(1),
    );

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    userMemories.forEach((memory) => {
      if (memory.mood) {
        moodCounts[memory.mood] = (moodCounts[memory.mood] || 0) + 1;
      }
    });

    const topMoods = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage:
          totalMemories > 0 ? Math.round((count / totalMemories) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate tag distribution
    const tagCounts: Record<string, number> = {};
    userMemories.forEach((memory) => {
      if (memory.memoryTags) {
        memory.memoryTags.forEach(({ tag }) => {
          if (tag) {
            tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
          }
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage:
          totalMemories > 0 ? Math.round((count / totalMemories) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate monthly activity
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyCounts: Record<string, number> = {};

    userMemories.forEach((memory) => {
      const date = new Date(memory.date);
      const month = monthNames[date.getMonth()];
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const monthlyActivity = monthNames.map((month) => ({
      month,
      memories: monthlyCounts[month] || 0,
    }));

    // Calculate weekly pattern
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyCounts: Record<string, number> = {};

    userMemories.forEach((memory) => {
      const date = new Date(memory.date);
      const day = dayNames[date.getDay()];
      weeklyCounts[day] = (weeklyCounts[day] || 0) + 1;
    });

    const weeklyPattern = dayNames.map((day) => ({
      day,
      memories: weeklyCounts[day] || 0,
    }));

    const sortedDates = userMemories
      .map((m) => new Date(m.date).toDateString())
      .sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let prevDate: Date | null = null;

    sortedDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffDays = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
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

    // Calculate Heatmap Data (last 365 days)
    const heatmap: Record<string, number> = {};
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    userMemories.forEach(memory => {
        const dateKey = new Date(memory.date).toISOString().split('T')[0];
        heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
    });

    // Calculate Tag Relationship Clusters (Co-occurrence)
    const tagCooccurrence: Record<string, Record<string, number>> = {};
    userMemories.forEach(memory => {
        const tags = memory.memoryTags.map(t => t.tag.name);
        tags.forEach(t1 => {
            if (!tagCooccurrence[t1]) tagCooccurrence[t1] = {};
            tags.forEach(t2 => {
              if (t1 !== t2) {
                tagCooccurrence[t1][t2] = (tagCooccurrence[t1][t2] || 0) + 1;
              }
            });
        });
    });

    const tagClusters = Object.entries(tagCooccurrence).map(([tag, relations]) => ({
        tag,
        related: Object.entries(relations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }))
    })).sort((a, b) => b.related.length - a.related.length).slice(0, 10);

    const analytics = {
      totalMemories,
      memoriesThisMonth,
      averagePerWeek,
      longestStreak,
      topMoods,
      topTags,
      monthlyActivity,
      weeklyPattern,
      heatmap,
      tagClusters
    };

    logger.info(`Analytics fetched for user ${user.id}`);

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
