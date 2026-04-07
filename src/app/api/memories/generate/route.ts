import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const limitResult = await rateLimit(`generate_${user.id}_${ip}`, 20, 60 * 60 * 1000); // 20 requests per hour

  if (!limitResult.success) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  try {
    const { title, content, style } = await req.json();

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content is required" }, { status: 400 });
    }

    // Strip HTML tags for the prompt to help the AI focus on text
    const cleanContent = (content || "").replace(/<[^>]*>?/gm, " ").trim();

    logger.info(
      `Generating AI content for memory. Title: "${title}", Content snippet: "${cleanContent.slice(0, 50)}..."`,
    );

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
Your task is to take the following memory details and expand them into a beautiful, evocative, and cohesive narrative.

IMPORTANT: You MUST use the "Current Content" provided below as your foundation. Do not ignore it. Build your entire story around these specific details and expand on them.

Writing Style: ${styleInstruction}

Memory Title: ${title || "Untitled"}
Current Content: ${cleanContent || "(No initial content provided, please generate based on the title alone)"}

Guidelines:
- If "Current Content" is provided, it is the absolute source of truth. Expand on the feelings, sensory details, and moments described there.
- Make it personal, emotional, and vivid.
- Keep it concise but descriptive (around 150-300 words).
- Do not invent entirely new historical facts, but rather expand on the atmosphere and emotions.
- Return ONLY the expanded content text. No title, no intro, no "Here is your story", just the story itself.`;

    const result = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.error("Error generating memory content:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
