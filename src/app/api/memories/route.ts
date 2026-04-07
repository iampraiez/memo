import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { memories, tags, memoryTags, memoryMedia } from "@/drizzle/db/schema";
import { desc, and, eq, inArray, or, lte, isNull } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const memorySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  date: z.string(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  unlockDate: z.string().nullable().optional(),
});

// GET - Fetch user's memories
export async function GET(req: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const now = new Date();
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get("isPublic");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query conditions
    const conditions = [eq(memories.userId, user.id)];

    if (isPublic !== null && isPublic !== undefined) {
      conditions.push(eq(memories.isPublic, isPublic === "true"));
    }

    // Filter by unlockDate (Memory Capsules)
    // Only return if unlockDate is null or in the past
    const unlockCondition = or(isNull(memories.unlockDate), lte(memories.unlockDate, now));
    if (unlockCondition) conditions.push(unlockCondition);

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
    const { user, error } = await requireAuth();
    if (error) return error;

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { success } = await rateLimit(`create_memory_${ip}`, 20, 60 * 1000); // 20 per minute

    if (!success) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const validatedData = memorySchema.parse(body);

    // Create memory
    const memoryId = validatedData.id || `mem-${uuidv4()}`;
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
        unlockDate: validatedData.unlockDate ? new Date(validatedData.unlockDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Handle Tags (Batch Operations to avoid N+1)
    if (validatedData.tags && validatedData.tags.length > 0) {
      const tagNames = validatedData.tags;

      const existingTags = await db.query.tags.findMany({
        where: inArray(tags.name, tagNames),
      });

      const existingTagNames = existingTags.map((t) => t.name);
      const newTagNames = tagNames.filter((t) => !existingTagNames.includes(t));

      let allTagIds: string[] = existingTags.map((t) => t.id);

      if (newTagNames.length > 0) {
        const newTagsData = newTagNames.map((name) => ({
          id: uuidv4(),
          name,
          color: "#3B82F6",
        }));

        const insertedTags = await db.insert(tags).values(newTagsData).returning({ id: tags.id });
        allTagIds = [...allTagIds, ...insertedTags.map((t) => t.id)];
      }

      if (allTagIds.length > 0) {
        const memoryTagsData = allTagIds.map((tagId) => ({
          id: uuidv4(),
          memoryId: newMemory.id,
          tagId,
        }));
        await db.insert(memoryTags).values(memoryTagsData);
      }
    }

    // Handle Images
    if (validatedData.images && validatedData.images.length > 0) {
      const imagesData = validatedData.images.map((url) => ({
        id: uuidv4(),
        memoryId: newMemory.id,
        url,
        type: "image",
        filename: "unknown",
        storageProvider: "cloudinary",
      }));
      await db.insert(memoryMedia).values(imagesData);
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
