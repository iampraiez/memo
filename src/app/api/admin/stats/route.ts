import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, memories, aiJobs } from "@/drizzle/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get system stats
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalMemoriesResult] = await db.select({ count: count() }).from(memories);

    // Get active users (users who created memories in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [activeUsersResult] = await db
      .selectDistinct({ userId: memories.userId })
      .from(memories)
      .where(sql`${memories.createdAt} >= ${thirtyDaysAgo}`);

    // Get pending AI jobs
    const pendingJobs = await db.query.aiJobs.findMany({
      where: eq(aiJobs.status, "pending"),
      limit: 10,
      orderBy: (aiJobs, { desc }) => [desc(aiJobs.createdAt)],
    });

    // Get processing jobs
    const processingJobs = await db.query.aiJobs.findMany({
      where: eq(aiJobs.status, "processing"),
      limit: 10,
      orderBy: (aiJobs, { desc }) => [desc(aiJobs.createdAt)],
    });

    // Get recent failed jobs
    const failedJobs = await db.query.aiJobs.findMany({
      where: eq(aiJobs.status, "failed"),
      limit: 5,
      orderBy: (aiJobs, { desc }) => [desc(aiJobs.createdAt)],
    });

    // Get recent system logs
    const recentLogs = await db.query.systemLogs.findMany({
      limit: 50,
      orderBy: (systemLogs, { desc }) => [desc(systemLogs.createdAt)],
    });

    // Calculate storage (approximate based on memory count and average image size)
    const avgMemorySize = 50 * 1024; // 50KB for text + metadata
    const avgImageSize = 800 * 1024; // 800KB for images
    const totalMediaCount = (totalMemoriesResult?.count || 0) * 1.5; // Estimated 1.5 images per memory
    const estimatedBytes =
      (totalMemoriesResult?.count || 0) * avgMemorySize + totalMediaCount * avgImageSize;
    const storageUsed = `${(estimatedBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;

    const stats = {
      totalUsers: totalUsersResult?.count || 0,
      activeUsers: Array.isArray(activeUsersResult) ? activeUsersResult.length : 0,
      totalMemories: totalMemoriesResult?.count || 0,
      storageUsed,
    };

    const jobQueue = [
      ...pendingJobs.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        error: job.error,
      })),
      ...processingJobs.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        error: job.error,
      })),
      ...failedJobs.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        error: job.error,
      })),
    ];

    const logs = recentLogs.map((log) => ({
      id: log.id,
      level: log.level,
      message: log.message,
      timestamp: log.createdAt.toISOString(),
      userId: log.userId,
    }));

    logger.info("Admin stats fetched");

    return NextResponse.json({ stats, jobQueue, logs }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching admin stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
