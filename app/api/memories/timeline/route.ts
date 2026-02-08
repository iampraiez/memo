import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows } from "@/drizzle/db/schema";
import { and, eq, or, inArray, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // 1. Get IDs of users I'm following
    const following = await db.query.follows.findMany({
        where: eq(follows.followerId, userId)
    });
    
    const followingIds = following.map(f => f.followingId);

    // 2. Fetch memories from myself and people I follow
    const allRelevantMemories = await db.query.memories.findMany({
      where: or(
        eq(memories.userId, userId),
        followingIds.length > 0 ? inArray(memories.userId, followingIds) : undefined
      ),
      orderBy: [desc(memories.date)],
      with: {
        user: true,
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true
          }
        }
      }
    });

    // Transform for the timeline
    const timeline = allRelevantMemories.map((mem: any) => ({
      ...mem,
      tags: mem.memoryTags.map((t: any) => t.tag.name),
      images: mem.memoryMedia.filter((m: any) => m.type.startsWith('image')).map((m: any) => m.url),
    }));

    return NextResponse.json({ memories: timeline });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
