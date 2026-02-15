import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { stories, memories as memoriesTable } from "@/drizzle/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

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

    // 3. Generate content with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const storyContent = result.response.text();

    // 4. Save to DB
    const newStory = {
      id: uuidv4(),
      userId: session.user.id,
      title: title || "My Memory Story",
      content: storyContent,
      tone,
      length,
      dateRange,
      status: "ready",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(stories).values(newStory);

    return NextResponse.json({ story: newStory });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
