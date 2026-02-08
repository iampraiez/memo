import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users } from "@/drizzle/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userSettings = {
      id: user.id,
      userId: user.id,
      name: user.name || "",
      email: user.email,
      avatar: user.image,
      bio: user.bio,
      createdAt: user.createdAt,
      preferences: {
        theme: "light",
      },
    };

    logger.info(`Settings fetched for user ${user.id}`);

    return NextResponse.json(userSettings, { status: 200 });
  } catch (error) {
    logger.error("Error fetching settings:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar, bio } = body;

    // Update user settings
    await db
      .update(users)
      .set({
        name,
        image: avatar,
        bio,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email));

    logger.info(`Settings updated for user ${session.user.email}`);

    return NextResponse.json({ message: "Settings updated" }, { status: 200 });
  } catch (error) {
    logger.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
