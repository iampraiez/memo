import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { follows } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = params.id;
    const followers = await db.query.follows.findMany({
      where: eq(follows.followingId, userId),
      with: {
        follower: true,
      },
    });

    // Check which followers the current user is following
    const currentUserFollowing = await db.query.follows.findMany({
      where: eq(follows.followerId, session.user.id),
    });
    const followingIds = new Set(currentUserFollowing.map((f) => f.followingId));

    return NextResponse.json({
      followers: followers.map((f) => ({
        id: f.follower.id,
        name: f.follower.name,
        username: f.follower.username,
        image: f.follower.image,
        bio: f.follower.bio,
        isFollowing: followingIds.has(f.follower.id),
      })),
    });
  } catch (error) {
    console.error("[Followers API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 });
  }
}
