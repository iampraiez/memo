import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    // Get all user memories
    const userMemories = await db.query.memories.findMany({
      where: eq(memories.userId, user.id),
      with: {
        memoryTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    // Calculate tag statistics
    const tagCounts: Record<string, number> = {};
    const tagColors: Record<string, string> = {};

    userMemories.forEach((memory) => {
      if (memory.memoryTags) {
        memory.memoryTags.forEach(({ tag }) => {
          if (tag) {
            const tagName = tag.name;
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            tagColors[tagName] =
              tag.color ||
              `hsl(${tagName.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0) % 360}, 70%, 60%)`;
          }
        });
      }
    });

    // Create tag objects
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({
        id: `tag-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        count,
        color: tagColors[name],
      }))
      .sort((a, b) => b.count - a.count);

    logger.info(`Fetched ${tags.length} tags for user ${user.id}`);

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching tags:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
