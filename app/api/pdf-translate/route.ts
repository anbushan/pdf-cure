import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { checkAiAccess, recordAiUsage } from "@/lib/requireAiAccess";

// Default Vercel function timeout (10s on Hobby) is too tight for a
// Claude round-trip on a long document; this raises the ceiling where the
// plan allows it (Hobby caps at 10s regardless, Pro honors up to 60s here).
export const maxDuration = 60;

const MAX_CHARS = 50000;

export async function POST(req: NextRequest) {
  const access = await checkAiAccess("Translate PDF");
  if (!access.ok) return access.response;

  try {
    const { text, targetLanguage } = (await req.json()) as { text?: string; targetLanguage?: string };

    if (!text || !text.trim() || !targetLanguage) {
      return NextResponse.json({ error: "Missing document text or a target language." }, { status: 400 });
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

    await recordAiUsage(access.userId, "Translate PDF");
    return NextResponse.json({ translated, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong translating this document." }, { status: 500 });
  }
}
