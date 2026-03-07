import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";
import { logger } from "@/custom/log/logger";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

async function generateContent(prompt: string) {
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log("Result:", result);
  return result.text;
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, style } = await req.json();

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content is required" }, { status: 400 });
    }

    logger.info(`Generating AI content for memory: ${title}: ${content}`);

    const styleGuides: Record<string, string> = {
      narrative:
        "Write in a classic narrative storytelling style. Use a natural flow with a beginning, middle, and reflective ending.",
      poetic:
        "Write in a poetic, lyrical style. Use vivid imagery, metaphors, and beautifully crafted sentences that evoke deep emotion.",
      journaling:
        "Write as a personal diary or journal entry. Use first-person perspective, stream of consciousness, and intimate reflections.",
      letter:
        "Write as if composing a heartfelt letter to someone dear. Use warm, personal address and conversational yet meaningful language.",
      cinematic:
        "Write in a cinematic, visual style. Describe scenes as if they were movie shots — focus on sensory details, lighting, atmosphere, and dramatic moments.",
    };

    const styleInstruction = styleGuides[style || "narrative"] || styleGuides.narrative;

    const prompt = `You are an expert storyteller and personal historian. 
Your task is to take the following memory snippet and expand it into a beautiful, evocative, and cohesive narrative.

Writing Style: ${styleInstruction}

Current Title: ${title || "Untitled"}
Current Content: ${content || ""}

Guidelines:
- Make it personal, emotional, and vivid.
- Keep it concise but descriptive (around 150-300 words).
- Do not invent entirely new events, but rather expand on the feelings and descriptive details implied by the existing text.
- Return ONLY the expanded content text, no preamble or extra commentary.`;

    const result = (await generateContent(prompt)) as string;

    return NextResponse.json({ content: result });
  } catch (error) {
    logger.error("Error generating memory content:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
