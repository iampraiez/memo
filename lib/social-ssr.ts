import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows } from "@/drizzle/db/schema";
import { and, eq, or, inArray, desc } from "drizzle-orm";
import { Memory } from "@/types/types";

export async function getSocialTimeline(_sort: string = "date") {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  try {
    // 1. Get IDs of users I'm following
    const following = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    const followingIds = following.map((f) => f.followingId);

    // Always include self
    const relevantUserIds = [userId, ...followingIds];

    // 2. Fetch memories
    const allRelevantMemories = await db.query.memories.findMany({
      where: and(
        inArray(memories.userId, relevantUserIds),
        or(
          eq(memories.userId, userId), // My memories (all)
          and(
            inArray(memories.userId, followingIds), // Others' memories
            eq(memories.isPublic, true), // Only public
          ),
        ),
      ),
      orderBy: [desc(memories.date)],
      limit: 10,
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

    // Transform for the client
    return allRelevantMemories.map((mem) => ({
      ...mem,
      date: mem.date.toISOString(),
      createdAt: mem.createdAt.toISOString(),
      updatedAt: mem.updatedAt.toISOString(),
      tags: mem.memoryTags.map((t) => t.tag.name),
      images: mem.memoryMedia.filter((m) => m.type.startsWith("image")).map((m) => m.url),
      reactionCount: mem.reactions.length,
      commentCount: mem.comments.length,
      comments: mem.comments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      reactions: mem.reactions.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    })) as Memory[];
  } catch (error) {
    console.error("Error fetching social timeline SSR:", error);
    return [];
  }
}
