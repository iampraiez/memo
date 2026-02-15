import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, follows, memories } from "@/drizzle/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: targetUserId } = await params;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count followers
    const followers = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, targetUserId));

    // Count following
    const following = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, targetUserId));

    // Count memories
    const userMemories = await db
      .select({ count: sql<number>`count(*)` })
      .from(memories)
      .where(eq(memories.userId, targetUserId));

    // Check if current user is following
    let isFollowing = false;
    if (session?.user?.id) {
      const followRecord = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, session.user.id), eq(follows.followingId, targetUserId)),
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      createdAt: user.createdAt,
      followersCount: Number(followers[0]?.count || 0),
      followingCount: Number(following[0]?.count || 0),
      memoriesCount: Number(userMemories[0]?.count || 0),
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
