import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, tags, memoryTags, memoryMedia } from "@/drizzle/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "@/custom/log/logger";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const updateMemorySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  date: z.string().optional(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

// GET - Fetch single memory
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const id = (await params).id;

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const [user] = await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch memory
    const [memory] = await db.query.memories.findMany({
      where: and(eq(memories.id, id), eq(memories.userId, user.id)),
      limit: 1,
    });

    if (!memory) {
      return NextResponse.json({ message: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ memory }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching memory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update memory
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const id = (await params).id;

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateMemorySchema.parse(body);

    // Get user ID
    const [user] = await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update memory
    const updateData: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const [updatedMemory] = await db
      .update(memories)
      .set(updateData)
      .where(and(eq(memories.id, id), eq(memories.userId, user.id)))
      .returning();

    if (!updatedMemory) {
      return NextResponse.json({ message: "Memory not found" }, { status: 404 });
    }

    // Handle Tags (replace existing)
    if (validatedData.tags !== undefined) {
      // Remove old associations
      await db.delete(memoryTags).where(eq(memoryTags.memoryId, id));

      if (validatedData.tags.length > 0) {
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
            memoryId: id,
            tagId: tagId,
          });
        }
      }
    }

    // Handle Images (replace existing)
    if (validatedData.images !== undefined) {
      // Remove old media
      await db.delete(memoryMedia).where(eq(memoryMedia.memoryId, id));

      if (validatedData.images.length > 0) {
        for (const url of validatedData.images) {
          await db.insert(memoryMedia).values({
            id: uuidv4(),
            memoryId: id,
            url: url,
            type: "image",
            filename: "unknown",
            storageProvider: "cloudinary",
          });
        }
      }
    }

    logger.info(`Updated memory ${id} for user ${user.id}`);

    return NextResponse.json(
      {
        memory: {
          ...updatedMemory,
          tags: validatedData.tags || [],
          images: validatedData.images || [],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.issues }, { status: 400 });
    }

    logger.error("Error updating memory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete memory
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const id = (await params).id;

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const [user] = await db.query.users.findMany({
      where: sql`email = ${session.user.email}`,
      limit: 1,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete memory
    const [deletedMemory] = await db
      .delete(memories)
      .where(and(eq(memories.id, id), eq(memories.userId, user.id)))
      .returning();

    if (!deletedMemory) {
      return NextResponse.json({ message: "Memory not found" }, { status: 404 });
    }

    logger.info(`Deleted memory ${id} for user ${user.id}`);

    return NextResponse.json({ message: "Memory deleted" }, { status: 200 });
  } catch (error) {
    logger.error("Error deleting memory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
