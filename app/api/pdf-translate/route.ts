import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 50000;

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage } = (await req.json()) as { text?: string; targetLanguage?: string };

    if (!text || !text.trim() || !targetLanguage) {
      return NextResponse.json({ error: "Missing document text or a target language." }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const truncated = text.length > MAX_CHARS;
    const content = text.slice(0, MAX_CHARS);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Translate the following document into ${targetLanguage}. Keep the same paragraph and heading structure — put a blank line between paragraphs, and prefix headings with "## " so they can be told apart from body text. Translate naturally and completely; don't summarize or omit anything. Output only the translated document text, nothing else.\n\n---\n\n${content}`,
        },
      ],
    });

    const translated = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ translated, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong translating this document." }, { status: 500 });
  }
}
