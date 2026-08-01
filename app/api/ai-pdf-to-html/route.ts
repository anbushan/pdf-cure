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
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Convert the extracted PDF text below into clean, well-structured, semantic HTML. Infer headings, paragraphs, lists, and tables from context (extracted PDF text usually has no formatting markers, so use judgment based on structure and content). Preserve all the actual information — don't summarize or omit anything. Output ONLY the HTML fragment: no <html>/<head>/<body> wrapper tags, no markdown code fences, no commentary before or after.\n\n---\n\n${content}`,
        },
      ],
    });

    const html = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim()
      .replace(/^```(?:html)?\n?/, "")
      .replace(/```$/, "");

    return NextResponse.json({ html, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong converting this PDF." }, { status: 500 });
  }
}
