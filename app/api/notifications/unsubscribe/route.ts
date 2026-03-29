import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { pushSubscriptions } from "@/drizzle/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ message: "Endpoint required" }, { status: 400 });
    }

    await db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, userId)));

    logger.info(`Push subscription removed for user ${userId}`);

    return NextResponse.json({ message: "Unsubscribed" }, { status: 200 });
  } catch (error) {
    logger.error("Error unsubscribing from notifications:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
