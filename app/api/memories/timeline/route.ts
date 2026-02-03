import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, familyMembers } from "@/drizzle/db/schema";
import { and, eq, or, inArray, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // 1. Get my own memories that I've shared
    // (Actually the UI "Family Timeline" usually shows memories shared WITH me + my public ones)
    
    // 2. Find people who have me in their family
    const familyRelations = await db.query.familyMembers.findMany({
      where: or(
        eq(familyMembers.ownerId, userId),
        eq(familyMembers.memberId, userId)
      ),
    });

    const relatedUserIds = familyRelations.map((rel: any) => 
      rel.ownerId === userId ? rel.memberId : rel.ownerId
    ).filter((id): id is string => !!id);

    // 3. Find memories shared with me OR by people in my family that are marked as public
    // For this app, we'll assume "public" in the context of memories means "shared with family"
    // Since there's no global public feed.
    
    // Fetch memories from myself and family members
    const allRelevantMemories = await db.query.memories.findMany({
      where: or(
        eq(memories.userId, userId),
        relatedUserIds.length > 0 ? inArray(memories.userId, relatedUserIds) : undefined
      ),
      orderBy: [desc(memories.date)],
      with: {
        user: true,
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true
          }
        }
      }
    });

    // Transform for the timeline
    const timeline = allRelevantMemories.map((mem: any) => ({
      ...mem,
      tags: mem.memoryTags.map((t: any) => t.tag.name),
      images: mem.memoryMedia.filter((m: any) => m.type.startsWith('image')).map((m: any) => m.url),
    }));

    return NextResponse.json({ memories: timeline });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
