import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, userPreferences } from "@/drizzle/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Default preferences if they don't exist in DB yet
    const preferences = user.preferences || {
      theme: "light",
      notifications: {},
      aiEnabled: true,
      autoBackup: true,
      privacyMode: "private",
    };

    const userSettings = {
      id: user.id,
      userId: user.id,
      name: user.name || "",
      email: user.email,
      avatar: user.image,
      bio: user.bio || "",
      username: user.username || "",
      isOnboarded: user.isOnboarded ?? false,
      createdAt: user.createdAt,
      preferences: {
        theme: preferences.theme || "light",
        aiEnabled: preferences.aiEnabled ?? true,
        autoBackup: preferences.autoBackup ?? true,
        privacyMode: preferences.privacyMode || "private",
        notifications: preferences.notifications || {},
      },
    };

    logger.info(`Settings fetched for user ${user.id} from database`);

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
    const { name, avatar, bio, username, image, preferences, isOnboarded } = body;

    // If username is being updated, check for uniqueness
    if (username) {
      const existingUser = await db.query.users.findFirst({
        where: sql`username = ${username} AND id != ${session.user.id}`,
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Username already taken. Please choose another." },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (image !== undefined || avatar !== undefined) updateData.image = image || avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.username = username;
    if (isOnboarded !== undefined) updateData.isOnboarded = isOnboarded;

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    // Update preferences if provided
    if (preferences) {
      const { aiEnabled, autoBackup, theme, privacyMode, notifications } = preferences;
      
      await db
        .insert(userPreferences)
        .values({
          id: uuidv4(),
          userId: session.user.id,
          aiEnabled: aiEnabled ?? true,
          autoBackup: autoBackup ?? true,
          theme: theme || "light",
          privacyMode: privacyMode || "private",
          notifications: notifications || {},
        })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: {
            aiEnabled: aiEnabled !== undefined ? aiEnabled : userPreferences.aiEnabled,
            autoBackup: autoBackup !== undefined ? autoBackup : userPreferences.autoBackup,
            theme: theme || userPreferences.theme,
            privacyMode: privacyMode || userPreferences.privacyMode,
            notifications: notifications || userPreferences.notifications,
          },
        });
    }

    logger.info(`Settings updated for user ${session.user.id}`);

    return NextResponse.json({ message: "Settings updated" }, { status: 200 });
  } catch (error) {
    logger.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
