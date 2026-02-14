import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { memories, follows } from "@/drizzle/db/schema";
import { and, eq, or, inArray, desc, ilike } from "drizzle-orm";
import { Timeline } from "@/app/_types/types";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const scope = searchParams.get("scope") || "mine"; // 'mine' | 'circle'
  const userId = session.user.id;

  if (!query || query.length < 2) {
      return NextResponse.json({ memories: [] });
  }

  try {
    let whereCondition;
    const searchCondition = or(
        ilike(memories.title, `%${query}%`),
        ilike(memories.content, `%${query}%`)
    );

    if (scope === "circle") {
      // Get following IDs
      const following = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));
      const followingIds = following.map((f) => f.followingId);

      // Include self
      whereCondition = and(
        searchCondition,
        or(
          eq(memories.userId, userId),
          and(
            inArray(memories.userId, followingIds),
            eq(memories.isPublic, true),
          ),
        ),
      );
    } else {
        // Mine only
        whereCondition = and(
            eq(memories.userId, userId),
            searchCondition
        );
    }

    const results = await db.query.memories.findMany({
      where: whereCondition,
      orderBy: [desc(memories.date)],
      limit: 50,
      with: {
        user: true,
        memoryMedia: true,
        memoryTags: {
          with: {
            tag: true
          }
        },
        reactions: true,
        comments: true
      }
    });

    // Transform
    const searchResults = (results as unknown as Timeline[]).map((mem) => ({
      ...mem,
      tags: mem.memoryTags.map((t) => t.tag.name),
      images: mem.memoryMedia.filter((m) => m.type.startsWith('image')).map((m) => m.url),
      reactionCount: mem.reactions.length,
      commentCount: mem.comments.length,
    }));

    return NextResponse.json({ memories: searchResults });

  } catch (error) {
    console.error("Error searching memories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
