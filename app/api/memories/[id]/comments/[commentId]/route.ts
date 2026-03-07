import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { comments } from "@/drizzle/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(
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
      where: and(eq(comments.id, params.commentId), eq(comments.memoryId, params.id)),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only the owner can delete the comment
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(comments).where(eq(comments.id, params.commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
