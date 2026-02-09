import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows, users } from "@/drizzle/db/schema";
import { and, eq, or, inArray, desc, sql, gte, lt } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // Timestamp for date sort
  const limit = parseInt(searchParams.get("limit") || "10");
  const sort = searchParams.get("sort") || "date"; // 'date' | 'random'

  try {
    const userId = session.user.id;

    // 1. Get IDs of users I'm following
    // Optimize: query only IDs
    const following = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, userId));
    const followingIds = following.map(f => f.followingId);
    
    // Always include self
    const relevantUserIds = [userId, ...followingIds];

    // Debug log
    // console.log("Fetching timeline for:", relevantUserIds);

    // 2. Fetch memories
    const query = db.query.memories.findMany({
      where: and(
        inArray(memories.userId, relevantUserIds),
        or(
            eq(memories.userId, userId), // My memories (all)
            and(
                inArray(memories.userId, followingIds), // Others' memories
                eq(memories.isPublic, true) // Only public
            )
        ),
        cursor ? lt(memories.date, new Date(cursor)) : undefined
      ),
      orderBy: sort === 'random' ? sql`RANDOM()` : desc(memories.date),
      limit: limit + 1, // Fetch one more to check if next page exists
      with: {
        user: true,
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true
          }
        },
        reactions: true,
        comments: true
      }
    });

    const allRelevantMemories = await query;
    
    // Pagination logic
    let nextCursor = null;
    if (allRelevantMemories.length > limit) {
        const nextItem = allRelevantMemories.pop(); // Remove the extra item
        if (nextItem) {
          nextCursor = nextItem.date.toISOString();
        }
    }

    // Transform
    const timeline = allRelevantMemories.map((mem: any) => ({
      ...mem,
      tags: mem.memoryTags.map((t: any) => t.tag.name),
      images: mem.memoryMedia.filter((m: any) => m.type.startsWith('image')).map((m: any) => m.url),
      reactionCount: mem.reactions.length,
      commentCount: mem.comments.length,
    //   user: {
    //       name: mem.user.name,
    //       image: mem.user.image,
    //       id: mem.user.id
    //   }
    }));

    return NextResponse.json({ 
        memories: timeline,
        nextCursor
    });

  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
