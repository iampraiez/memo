import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/custom/log/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const [user] = await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get all user memories
    const userMemories = await db.query.memories.findMany({
      where: eq(memories.userId, user.id),
      with: {
        memoryTags: {
          with: {
            tag: true
          }
        }
      }
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
             tagColors[tagName] = tag.color ||  `hsl(${tagName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) % 360}, 70%, 60%)`;
          }
        });
      }
    });

    // Create tag objects
    const tags = Object.entries(tagCounts).map(([name, count]) => ({
      id: `tag-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      count,
      color: tagColors[name],
    })).sort((a, b) => b.count - a.count);

    logger.info(`Fetched ${tags.length} tags for user ${user.id}`);

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching tags:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
