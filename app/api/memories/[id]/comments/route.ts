import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { comments } from "@/drizzle/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  const memoryId = params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryComments = await db.query.comments.findMany({
      where: eq(comments.memoryId, memoryId),
      with: {
        user: true,
      },
      orderBy: [desc(comments.createdAt)],
    });

    return NextResponse.json({ comments: memoryComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  const memoryId = params.id;


  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newComment = {
      id: uuidv4(),
      memoryId,
      userId: session.user.id,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(comments).values(newComment);

    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
