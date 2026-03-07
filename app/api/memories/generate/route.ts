import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/config/env";
import { logger } from "@/custom/log/logger";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content is required" }, { status: 400 });
    }

    logger.info(`Generating AI content for memory: ${title}`);

    const prompt = `You are an expert storyteller and personal historian. 
Your task is to take the following memory snippet and expand it into a beautiful, evocative, and cohesive narrative.

Current Title: ${title || "Untitled"}
Current Content: ${content || ""}

Guidelines:
- Make it personal, emotional, and vivid.
- Keep it concise but descriptive (around 150-300 words).
- Use a natural, reflective, and warm tone.
- Do not invent entirely new events, but rather expand on the feelings and descriptive details implied by the existing text.
- Return ONLY the expanded content text, no preamble or extra commentary.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text().trim();

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    logger.error("Error generating memory content:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
