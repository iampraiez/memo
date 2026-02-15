import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { follows } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;

  try {
    const following = await db.query.follows.findMany({
      where: eq(follows.followerId, userId),
      with: {
        following: true,
      },
      orderBy: (follows, { desc }) => [desc(follows.createdAt)],
    });

    const results = following.map((f) => ({
      ...f.following,
      isFollowing: true, // They are definitely followed as they are in the following list
    }));

    return NextResponse.json({ following: results });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
