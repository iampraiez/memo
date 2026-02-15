import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows } from "@/drizzle/db/schema";
import { and, eq, or, inArray, desc, sql, lt } from "drizzle-orm";
import { Timeline } from "@/types/types";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sort = searchParams.get("sort") || "date";

  try {
    const userId = session.user.id;

    const following = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    const followingIds = following.map((f) => f.followingId);

    const relevantUserIds = [userId, ...followingIds];

    const query = db.query.memories.findMany({
      where: and(
        inArray(memories.userId, relevantUserIds),
        or(
          eq(memories.userId, userId),
          and(inArray(memories.userId, followingIds), eq(memories.isPublic, true)),
        ),
        cursor ? lt(memories.date, new Date(cursor)) : undefined,
      ),
      orderBy: sort === "random" ? sql`RANDOM()` : desc(memories.date),
      limit: limit + 1,
      with: {
        user: true,
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true,
          },
        },
        reactions: true,
        comments: true,
      },
    });

    const allRelevantMemories = (await query) as unknown as Timeline[];

    let nextCursor = null;
    if (allRelevantMemories.length > limit) {
      const nextItem = allRelevantMemories.pop();
      if (nextItem) {
        nextCursor = nextItem.date.toISOString();
      }
    }

    const timeline = allRelevantMemories.map((mem: Timeline) => ({
      ...mem,
      tags: mem.memoryTags.map((t) => t.tag.name),
      images: mem.memoryMedia.filter((m) => m.type.startsWith("image")).map((m) => m.url),
      reactionCount: mem.reactions.length,
      commentCount: mem.comments.length,
    }));

    return NextResponse.json({
      memories: timeline,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
