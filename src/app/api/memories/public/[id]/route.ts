import db from "@/drizzle";
import { memories } from "@/drizzle/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: memoryId } = await params;

  try {
    const memory = await db.query.memories.findFirst({
      where: and(eq(memories.id, memoryId), eq(memories.isPublic, true)),
      with: {
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!memory) {
      return NextResponse.json({ error: "Memory not found or private" }, { status: 404 });
    }

    // Format for the frontend (Match Memory type)
    const formattedMemory = {
      ...memory,
      date: memory.date.toISOString(),
      createdAt: memory.createdAt.toISOString(),
      updatedAt: memory.updatedAt.toISOString(),
      images: memory.memoryMedia.map((m) => m.url),
      tags: memory.memoryTags.map((mt) => mt.tag.name),
    };

    return NextResponse.json({ memory: formattedMemory });
  } catch (error: any) {
    console.error("Public memory fetch failed:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
