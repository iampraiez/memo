import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, tags, memoryTags, memoryMedia } from "@/drizzle/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { logger } from "@/custom/log/logger";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const memorySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  date: z.string(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

// GET - Fetch user's memories
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get("isPublic");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user ID
    interface User {
      id: string;
      email: string;
    }
    const [user] = (await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    })) as User[];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Build query conditions
    const conditions = [eq(memories.userId, user.id)];

    if (isPublic !== null && isPublic !== undefined) {
      conditions.push(eq(memories.isPublic, isPublic === "true"));
    }

    // Fetch memories
    const userMemories = await db.query.memories.findMany({
      where: and(...conditions),
      orderBy: [desc(memories.date)],
      limit,
      offset,
      with: {
        memoryTags: {
          with: { tag: true },
        },
        memoryMedia: true,
      },
    });

    if (!userMemories) {
      logger.warn(`No memories found context for user ${user.id}`);
      return NextResponse.json({ memories: [] }, { status: 200 });
    }

    // Transform result to include flattened tags and images
    const formattedMemories = userMemories.map((mem) => ({
      ...mem,
      tags: mem.memoryTags ? mem.memoryTags.map((mt) => mt.tag.name) : [],
      images: mem.memoryMedia ? mem.memoryMedia.map((mm) => mm.url) : [],
    }));

    logger.info(`Fetched ${formattedMemories.length} memories for user ${user.id}`);

    return NextResponse.json({ memories: formattedMemories }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error("Error fetching memories:", { error: errorMessage, stack: errorStack });

    return NextResponse.json(
      { message: "Internal Server Error", error: errorMessage },
      { status: 500 },
    );
  }
}

// POST - Create new memory
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = memorySchema.parse(body);

    // Get user ID
    interface User {
      id: string;
      email: string;
    }
    const [user] = (await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    })) as User[];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Create memory
    const memoryId = `mem-${uuidv4()}`;
    const [newMemory] = await db
      .insert(memories)
      .values({
        id: memoryId,
        userId: user.id,
        title: validatedData.title,
        content: validatedData.content,
        date: new Date(validatedData.date),
        mood: validatedData.mood,
        location: validatedData.location,
        isPublic: validatedData.isPublic || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Handle Tags
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        let tagId;
        const existingTag = await db.query.tags.findFirst({
          where: eq(tags.name, tagName),
        });

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          tagId = uuidv4();
          await db.insert(tags).values({
            id: tagId,
            name: tagName,
            color: "#3B82F6",
          });
        }

        await db.insert(memoryTags).values({
          id: uuidv4(),
          memoryId: newMemory.id,
          tagId: tagId,
        });
      }
    }

    // Handle Images
    if (validatedData.images && validatedData.images.length > 0) {
      for (const url of validatedData.images) {
        await db.insert(memoryMedia).values({
          id: uuidv4(),
          memoryId: newMemory.id,
          url: url,
          type: "image",
          filename: "unknown",
          storageProvider: "local",
        });
      }
    }

    // Re-fetch memory with relations to return complete object
    // Or construct it manually to save a query.
    // Manual construction is faster.
    const returnedMemory = {
      ...newMemory,
      tags: validatedData.tags || [],
      images: validatedData.images || [],
    };

    logger.info(`Created memory ${newMemory.id} for user ${user.id}`);

    return NextResponse.json({ memory: returnedMemory }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.issues }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error creating memory:", { error: errorMessage });

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
