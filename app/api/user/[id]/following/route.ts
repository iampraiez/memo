import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { follows, users } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = params.id;
    const following = await db.query.follows.findMany({
      where: eq(follows.followerId, userId),
      with: {
        following: true,
      },
    });

    return NextResponse.json({ 
      following: following.map(f => ({
        id: f.following.id,
        name: f.following.name,
        username: f.following.username,
        image: f.following.image,
        bio: f.following.bio,
      })) 
    });
  } catch (error) {
    console.error("[Following API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch following" }, { status: 500 });
  }
}
