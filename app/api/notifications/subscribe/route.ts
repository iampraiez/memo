import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, pushSubscriptions } from "@/drizzle/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const subscription = await req.json();
    if (!subscription || !subscription.endpoint) {
        return NextResponse.json({ message: "Invalid subscription" }, { status: 400 });
    }

    // Insert or update subscription
    // Since endpoint is unique, we can use onConflictDoUpdate or just try insert and ignore unique constraint errors
    // Drizzle doesn't have upsert for all drivers easily, but for PG onConflictDoUpdate works.
    await db.insert(pushSubscriptions).values({
        id: crypto.randomUUID(),
        userId: userId, 
        endpoint: subscription.endpoint,
        keys: subscription.keys,
    }).onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { 
            keys: subscription.keys, 
            userId: userId 
        }
    });

    logger.info(`Push subscription updated for user ${session.user.id}`);

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (error) {
    logger.error("Error subscribing to notifications:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
