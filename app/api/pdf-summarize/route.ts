import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { checkAiAccess, recordAiUsage } from "@/lib/requireAiAccess";

// Default Vercel function timeout (10s on Hobby) is too tight for a
// Claude round-trip on a long document; this raises the ceiling where the
// plan allows it (Hobby caps at 10s regardless, Pro honors up to 60s here).
export const maxDuration = 60;

const MAX_CHARS = 60000;

export async function POST(req: NextRequest) {
  const access = await checkAiAccess("Summarize PDF");
  if (!access.ok) return access.response;

  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No document text was provided." }, { status: 400 });
    }
    const apiKey = await getSetting("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "The server is missing ANTHROPIC_API_KEY. Set it in the admin Configuration panel or .env." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
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

    await recordAiUsage(access.userId, "Summarize PDF");
    return NextResponse.json({ summary, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong generating the summary." }, { status: 500 });
  }
}
