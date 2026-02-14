import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows } from "@/drizzle/db/schema";
import { eq, or, inArray, desc } from "drizzle-orm";
import { Memory } from "@/types/types";

export async function getTimelineMemories() {
  const session = await auth();
  if (!session?.user?.id) return null;

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

  // Transform for the timeline to match the expected Memory type
  return allRelevantMemories.map((mem) => ({
    ...mem,
    date: mem.date.toISOString(),
    createdAt: mem.createdAt.toISOString(),
    updatedAt: mem.updatedAt.toISOString(),
    tags: mem.memoryTags.map((t) => t.tag.name),
    images: mem.memoryMedia
      .filter((m) => m.type.startsWith("image"))
      .map((m) => m.url),
    comments: (mem as typeof mem & { 
      comments?: Array<{ 
        id: string; 
        memoryId: string; 
        userId: string; 
        content: string; 
        createdAt: Date; 
        updatedAt: Date; 
      }> 
    }).comments?.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })) || [],
    reactions: (mem as typeof mem & { 
      reactions?: Array<{ 
        id: string; 
        memoryId: string; 
        userId: string; 
        type: string; 
        createdAt: Date; 
      }> 
    }).reactions?.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })) || [],
  })) as Memory[];
}
