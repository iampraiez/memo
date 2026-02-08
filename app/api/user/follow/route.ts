import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { follows } from "@/drizzle/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

    if (followingId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existing = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, followingId)
      ),
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already following" });
    }

    await db.insert(follows).values({
      id: uuidv4(),
      followerId: session.user.id,
      followingId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
