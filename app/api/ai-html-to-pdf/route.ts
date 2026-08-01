import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 60000;

export async function POST(req: NextRequest) {
  try {
    const { html } = (await req.json()) as { html?: string };
    if (!html || !html.trim()) {
      return NextResponse.json({ error: "No HTML was provided." }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "The server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const truncated = html.length > MAX_CHARS;
    const content = html.slice(0, MAX_CHARS);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Clean up and restructure the HTML below into a well-formatted, readable document. Remove navigation menus, ads, cookie banners, scripts, tracking pixels, and any other clutter — keep only the actual content. Use proper semantic tags (h1/h2/h3, p, ul/ol/li, table, blockquote, strong/em) and preserve the original meaning, facts, and structure — don't summarize or shorten the content itself. Output ONLY the cleaned HTML fragment: no <html>/<head>/<body> wrapper tags, no markdown code fences, no commentary before or after.\n\n---\n\n${content}`,
        },
      ],
    });

    const cleanedHtml = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim()
      .replace(/^```(?:html)?\n?/, "")
      .replace(/```$/, "");

    return NextResponse.json({ html: cleanedHtml, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong cleaning up this HTML." }, { status: 500 });
  }
}
