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
  return allRelevantMemories.map((mem: any) => ({
    ...mem,
    tags: mem.memoryTags.map((t: any) => t.tag.name),
    images: mem.memoryMedia.filter((m: any) => m.type.startsWith('image')).map((m: any) => m.url),
  })) as Memory[];
}
