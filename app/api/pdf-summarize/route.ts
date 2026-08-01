import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 60000;

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No document text was provided." }, { status: 400 });
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
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: `Summarize the document below. Open with a one-sentence overview, then a few short paragraphs or bullet points covering the key facts, numbers, and conclusions. Don't pad it — be concise but don't leave out anything important.\n\n---\n\n${content}`,
        },
      ],
    });

    const summary = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ summary, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong generating the summary." }, { status: 500 });
  }
}
