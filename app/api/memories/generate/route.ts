import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";
import { logger } from "@/custom/log/logger";

export const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const cleanJSON = (text: string) => {
  const match = text.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) : null;
};

export async function generateContent(prompt: string) {
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return result.text;
}

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

    const result = (await generateContent(prompt)) as string;
    const generatedContent = cleanJSON(result);

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    logger.error("Error generating memory content:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
