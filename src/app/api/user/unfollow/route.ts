import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { follows } from "@/drizzle/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId: followingId } = await req.json();

    if (!followingId) {
      return NextResponse.json({ error: "Following ID required" }, { status: 400 });
    }

    await db
      .delete(follows)
      .where(and(eq(follows.followerId, session.user.id), eq(follows.followingId, followingId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
