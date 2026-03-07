import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { comments } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string; commentId: string }> },
) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, params.commentId),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const userId = session.user.id;
    let newLikes = [...(comment.likes || [])];

    if (newLikes.includes(userId)) {
      // Unlike
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      // Like
      newLikes.push(userId);
    }

    await db.update(comments).set({ likes: newLikes }).where(eq(comments.id, params.commentId));

    return NextResponse.json({ likes: newLikes });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
