import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import {
  memories,
  tags,
  memoryTags,
  memoryMedia,
  notifications,
  familyMembers,
  follows,
} from "@/drizzle/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/api-utils";
import { CloudinaryService } from "@/services/cloudinary.service";
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
  unlockDate: z.string().nullable().optional(),
});

// GET - Fetch single memory
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const id = (await params).id;

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
    const { user, error } = await requireAuth();
    if (error) return error;

    const id = (await params).id;

    const body = await req.json();
    const validatedData = updateMemorySchema.parse(body);

    // Update memory
    const updateData: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Strip out array relations that don't belong in the main 'memories' table row
    delete updateData.tags;
    delete updateData.images;

    if (validatedData.unlockDate) {
      updateData.unlockDate = new Date(validatedData.unlockDate);
    } else if (validatedData.unlockDate === null) {
      updateData.unlockDate = null;
    }

    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    // Generate shareToken if turning public and it doesn't exist
    if (validatedData.isPublic === true) {
      const currentMemory = await db.query.memories.findFirst({
        where: eq(memories.id, id),
      });

      if (!currentMemory?.shareToken) {
        updateData.shareToken = uuidv4();
      }

      // If it's becoming public now (was private before)
      if (currentMemory && !currentMemory.isPublic) {
        // Find all family members and followers to notify
        const family = await db.query.familyMembers.findMany({
          where: or(eq(familyMembers.ownerId, user.id), eq(familyMembers.memberId, user.id)),
        });

        const followerList = await db.query.follows.findMany({
          where: eq(follows.followingId, user.id),
        });

        const userIdsToNotify = new Set<string>();
        family.forEach((f) => {
          const target = f.ownerId === user.id ? f.memberId : f.ownerId;
          if (target) userIdsToNotify.add(target);
        });
        followerList.forEach((f) => userIdsToNotify.add(f.followerId));

        // Create notifications
        const notificationValues = Array.from(userIdsToNotify).map((targetId) => ({
          id: uuidv4(),
          userId: targetId,
          type: "memory_share",
          title: "New Shared Memory",
          message: `${user.name || "A friend"} shared a new memory: "${validatedData.title || currentMemory.title}"`,
          relatedId: id,
          read: false,
        }));

        if (notificationValues.length > 0) {
          await db.insert(notifications).values(notificationValues);
        }
      }
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
            memoryId: id,
            tagId,
          }));
          await db.insert(memoryTags).values(memoryTagsData);
        }
      }
    }

    // Handle Images (replace existing)
    if (validatedData.images !== undefined) {
      // Fetch old media first to delete from Cloudinary
      const oldMedia = await db.query.memoryMedia.findMany({
        where: eq(memoryMedia.memoryId, id),
      });

      // Remove old media from DB
      await db.delete(memoryMedia).where(eq(memoryMedia.memoryId, id));

      if (validatedData.images.length > 0) {
        const imagesData = validatedData.images.map((url) => ({
          id: uuidv4(),
          memoryId: id,
          url,
          type: "image",
          filename: "unknown",
          storageProvider: "cloudinary",
        }));
        await db.insert(memoryMedia).values(imagesData);
      }

      // Cleanup old Cloudinary images
      for (const media of oldMedia) {
        if (media.storageProvider === "cloudinary" && media.url) {
          // Only delete if the URL is NOT in the new list (prevent deleting images that are kept)
          if (!validatedData.images.includes(media.url)) {
            const publicId = CloudinaryService.extractPublicId(media.url);
            if (publicId) {
              await CloudinaryService.deleteFile(publicId);
            }
          }
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
    const { user, error } = await requireAuth();
    if (error) return error;

    const id = (await params).id;

    // Fetch memory first to get media
    const memoryToDelete = await db.query.memories.findFirst({
      where: and(eq(memories.id, id), eq(memories.userId, user.id)),
      with: { memoryMedia: true },
    });

    if (!memoryToDelete) {
      return NextResponse.json({ message: "Memory not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    if (memoryToDelete.memoryMedia && memoryToDelete.memoryMedia.length > 0) {
      for (const media of memoryToDelete.memoryMedia) {
        if (media.storageProvider === "cloudinary" && media.url) {
          const publicId = CloudinaryService.extractPublicId(media.url);
          if (publicId) {
            await CloudinaryService.deleteFile(publicId);
          }
        }
      }
    }

    // Delete memory
    await db.delete(memories).where(eq(memories.id, id));

    logger.info(`Deleted memory ${id} for user ${user.id}`);

    return NextResponse.json({ message: "Memory deleted" }, { status: 200 });
  } catch (error) {
    logger.error("Error deleting memory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
