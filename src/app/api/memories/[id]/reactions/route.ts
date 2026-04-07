import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { reactions, memories, notifications } from "@/drizzle/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const memoryId = params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryReactions = await db.query.reactions.findMany({
      where: eq(reactions.memoryId, memoryId),
      with: {
        user: true,
      },
    });

    return NextResponse.json({ reactions: memoryReactions });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const memoryId = params.id;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type = "heart" } = await req.json();
    const userId = session.user.id;

    // Check if user already reacted
    const existingReaction = await db.query.reactions.findFirst({
      where: and(eq(reactions.memoryId, memoryId), eq(reactions.userId, userId)),
    });

    if (existingReaction) {
      // Toggle off if same type, otherwise update
      if (existingReaction.type === type) {
        await db.delete(reactions).where(eq(reactions.id, existingReaction.id));
        return NextResponse.json({ action: "removed" });
      } else {
        await db.update(reactions).set({ type }).where(eq(reactions.id, existingReaction.id));
        return NextResponse.json({ action: "updated", reaction: { ...existingReaction, type } });
      }
    }

    const newReaction = {
      id: uuidv4(),
      memoryId,
      userId,
      type,
      createdAt: new Date(),
    };

    await db.insert(reactions).values(newReaction);

    // Notification trigger
    const memory = await db.query.memories.findFirst({
      where: eq(memories.id, memoryId),
      columns: { userId: true, title: true },
    });

    if (memory && memory.userId !== userId) {
      await db.insert(notifications).values({
        id: uuidv4(),
        userId: memory.userId,
        type: "reaction",
        title: "New Reaction",
        message: `${session.user.name || "Someone"} reacted to your memory "${memory.title}"`,
        relatedId: memoryId,
        read: false,
      });
    }

    return NextResponse.json({ action: "added", reaction: newReaction });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
