import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();

    // Query for memories from previous years on this same day
    const historicalMemories = await db.query.memories.findMany({
      where: and(
        eq(memories.userId, user.id),
        sql`EXTRACT(MONTH FROM ${memories.date}) = ${currentMonth}`,
        sql`EXTRACT(DAY FROM ${memories.date}) = ${currentDay}`,
        sql`EXTRACT(YEAR FROM ${memories.date}) < ${currentYear}`,
      ),
      with: {
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (memories, { desc }) => [desc(memories.date)],
    });

    return NextResponse.json({ memories: historicalMemories }, { status: 200 });
  } catch (err) {
    logger.error("Error fetching On This Day highlights:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
