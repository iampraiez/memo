import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { notifications } from "@/drizzle/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, session.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    return NextResponse.json({ notifications: userNotifications });
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, title, message, relatedId } = await req.json();

    const newNotification = await db
      .insert(notifications)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        type,
        title,
        message,
        relatedId,
        read: false,
      })
      .returning();

    return NextResponse.json({ notification: newNotification[0] });
  } catch (error) {
    console.error("[Notifications API] Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Mark all as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.read, false)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notifications API] Error marking all as read:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
