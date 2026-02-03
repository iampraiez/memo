import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { comments } from "@/drizzle/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  const commentId = params.id;


  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingComment = await db.query.comments.findFirst({
      where: and(
        eq(comments.id, commentId),
        eq(comments.userId, session.user.id)
      ),
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 });
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
