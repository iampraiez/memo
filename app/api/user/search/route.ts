import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, follows, familyMembers } from "@/drizzle/db/schema";
import { ilike, and, ne, eq, or } from "drizzle-orm";
import { logger } from "@/lib/logger";

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
      where: and(
        ne(users.id, session.user.id),
        or(ilike(users.username, `%${query}%`), ilike(users.name, `%${query}%`)),
      ),
      limit: 10,
    });

    // Check following status for each found user
    const userId = session.user.id as string;

    const usersWithStatus = await Promise.all(
      foundUsers.map(async (u) => {
        const follow = await db.query.follows.findFirst({
          where: and(eq(follows.followerId, userId), eq(follows.followingId, u.id)),
        });

        const family = await db.query.familyMembers.findFirst({
          where: and(eq(familyMembers.ownerId, userId), eq(familyMembers.memberId, u.id)),
        });

        return {
          ...u,
          isFollowing: !!follow,
          familyStatus: family?.status || null,
          relationship: family?.relationship || null,
        };
      }),
    );

    return NextResponse.json({ users: usersWithStatus }, { status: 200 });
  } catch (error) {
    logger.error("Error searching users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
