import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows } from "@/drizzle/db/schema";
import { and, eq, desc } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: targetUserId } = await params;

  try {
    const isOwner = session?.user?.id === targetUserId;

    // Check if the current user follows this profile (for access to private memories)
    let isFollowing = false;
    if (session?.user?.id && !isOwner) {
      const followRecord = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, session.user.id), eq(follows.followingId, targetUserId)),
      });
      isFollowing = !!followRecord;
    }

    const userMemories = await db.query.memories.findMany({
      where: and(
        eq(memories.userId, targetUserId),
        // An owner sees all their memories; followers/visitors see only public ones
        isOwner ? undefined : eq(memories.isPublic, true),
      ),
      orderBy: [desc(memories.date)],
      limit: 20,
      with: {
        memoryMedia: true,
        memoryTags: {
          with: { tag: true },
        },
        reactions: true,
        comments: true,
      },
    });

    const result = userMemories.map((mem) => ({
      id: mem.id,
      title: mem.title,
      content: mem.content,
      date: mem.date.toISOString(),
      location: mem.location,
      mood: mem.mood,
      isPublic: mem.isPublic,
      createdAt: mem.createdAt.toISOString(),
      updatedAt: mem.updatedAt.toISOString(),
      tags: mem.memoryTags.map((t) => t.tag.name),
      images: mem.memoryMedia.filter((m) => m.type.startsWith("image")).map((m) => m.url),
      reactionCount: mem.reactions.length,
      commentCount: mem.comments.length,
    }));

    return NextResponse.json({ memories: result, isFollowing });
  } catch (error) {
    console.error("Error fetching user memories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
