import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { stories, memories as memoriesTable } from "@/drizzle/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/config/env";
import { rateLimit } from "@/lib/rate-limit";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userStories = await db.query.stories.findMany({
      where: eq(stories.userId, session.user.id),
      orderBy: [desc(stories.createdAt)],
    });

    return NextResponse.json({ stories: userStories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { success } = await rateLimit(`generate_story_${ip}`, 5, 24 * 60 * 60 * 1000); // 5 per day

  if (!success) {
    return NextResponse.json(
      { error: "Daily story generation limit reached. Please try again tomorrow." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { title, tone, length, dateRange } = body;

    // 1. Fetch memories for context
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Inclusion of the full end day

    const userMemories = await db.query.memories.findMany({
      where: and(
        eq(memoriesTable.userId, session.user.id),
        gte(memoriesTable.date, startDate),
        lte(memoriesTable.date, endDate),
      ),
      orderBy: [desc(memoriesTable.date)],
    });

    if (!userMemories || userMemories.length === 0) {
      return NextResponse.json(
        { error: "No memories found for this period to generate a story." },
        { status: 400 },
      );
    }

    // 2. Prepare the prompt
    const memoryContext = userMemories
      .map((m) => {
        const dateStr = new Date(m.date).toLocaleDateString();
        return `Date: ${dateStr}\nTitle: ${m.title}\nContent: ${m.content}\nMood: ${m.mood || "N/A"}`;
      })
      .join("\n---\n");

    const prompt = `You are an expert storyteller and personal historian. 
Based on the following personal memories from ${dateRange.start} to ${dateRange.end}, write a beautiful and cohesive narrative.

Tone: ${tone}
Length: ${length === "short" ? "about 300 words" : length === "long" ? "about 1500 words" : "about 700 words"}

Memories:
${memoryContext}

Guidelines:
- Flow the memories into a single chronological or thematic story.
- Use the specified tone throughout.
- Make it personal and evocative.
- Do not add fake facts, only expand on the existing memories.
- Return only the story text.`;

    // 3. Generate content with Gemini (Streaming)
    const result = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const storyId = uuidv4();
    const newStory = {
      id: storyId,
      userId: session.user.id,
      title: title || "My Memory Story",
      content: "", // Will be updated after stream
      tone,
      length,
      dateRange,
      status: "generating" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Initial insert
    await db.insert(stories).values(newStory);

    const encoder = new TextEncoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Update DB when done
          await db
            .update(stories)
            .set({
              content: fullContent,
              status: "ready",
              updatedAt: new Date(),
            })
            .where(eq(stories.id, storyId));

          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          await db
            .update(stories)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(stories.id, storyId));
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Story-Id": storyId, // Send ID in header so client knows which story this is
      },
    });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
