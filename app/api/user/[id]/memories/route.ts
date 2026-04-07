import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows, users } from "@/drizzle/db/schema";
import { and, eq, desc, or } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: targetIdentifier } = await params;
  const { searchParams } = new URL(req.url);
  const limitValue = searchParams.get("limit");
  const limit = limitValue ? parseInt(limitValue, 10) : 50;

  try {
    // 1. Resolve targetIdentifier to a specific user
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.id, targetIdentifier),
        eq(users.username, targetIdentifier),
        eq(users.email, targetIdentifier),
      ),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUserId = user.id;
    const isOwner = session?.user?.id === targetUserId;

    // 2. Check if the current user follows this profile (for access to private memories)
    let isFollowing = false;
    if (session?.user?.id && !isOwner) {
      const followRecord = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, session.user.id), eq(follows.followingId, targetUserId)),
      });
      isFollowing = !!followRecord;
    }

    // 3. Fetch memories
    const userMemories = await db.query.memories.findMany({
      where: and(
        eq(memories.userId, targetUserId),
        // An owner sees all their memories; visitors see only public ones
        // (In the future, followers might see more, but for now it's public only)
        isOwner ? undefined : eq(memories.isPublic, true),
      ),
      orderBy: [desc(memories.date)],
      limit: limit,
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
