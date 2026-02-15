import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, follows } from "@/drizzle/db/schema";
import { ilike, and, ne, eq } from "drizzle-orm";
import { logger } from "@/custom/log/logger";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    // Search users by username or name, excluding the current user
    const foundUsers = await db.query.users.findMany({
      where: and(ne(users.id, session.user.id), ilike(users.username, `%${query}%`)),
      limit: 10,
    });

    // Check following status for each found user
    const userId = session.user.id as string;

    const usersWithFollowingStatus = await Promise.all(
      foundUsers.map(async (u) => {
        const follow = await db.query.follows.findFirst({
          where: and(eq(follows.followerId, userId), eq(follows.followingId, u.id)),
        });
        return {
          ...u,
          isFollowing: !!follow,
        };
      }),
    );

    return NextResponse.json({ users: usersWithFollowingStatus }, { status: 200 });
  } catch (error) {
    logger.error("Error searching users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
