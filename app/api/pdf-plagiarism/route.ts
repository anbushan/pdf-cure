import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { checkAiAccess, recordAiUsage } from "@/lib/requireAiAccess";

// Default Vercel function timeout (10s on Hobby) is too tight for a
// Claude round-trip on a long document; this raises the ceiling where the
// plan allows it (Hobby caps at 10s regardless, Pro honors up to 60s here).
export const maxDuration = 60;

const MAX_CHARS = 60000;

const PROMPT = `You're assessing a document's writing for signs it may contain unoriginal or copy-pasted content. You cannot search the internet or compare this text against any external source — base this purely on internal writing-style signals: sudden shifts in tone, vocabulary level, or formatting between sections; passages that read as generic or templated; awkward phrasing suggesting a rough paraphrase or translation; a voice that's inconsistent with the rest of the document.

Be conservative. Natural variety (an introduction reading differently from a technical section, for instance) is normal and should NOT be flagged. Most well-written original documents should come back with zero or very few flags. Only flag passages with a genuinely suspicious pattern.

Respond with ONLY valid JSON, no other text, in exactly this shape:
{"riskLevel": "low" | "medium" | "high", "summary": "one or two sentence overall assessment", "flags": [{"excerpt": "short verbatim quote from the text, under 200 characters", "reason": "why this passage stood out"}]}

Document:
---
`;

export async function POST(req: NextRequest) {
  const access = await checkAiAccess("Detect Plagiarism");
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
      max_tokens: 1200,
      messages: [{ role: "user", content: `${PROMPT}${content}` }],
    });

    const raw = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    let parsed: { riskLevel: string; summary: string; flags: { excerpt: string; reason: string }[] };
    try {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      // Degrade gracefully if Claude didn't return clean JSON, rather than erroring the whole request out.
      parsed = { riskLevel: "low", summary: raw || "Couldn't produce a structured report for this document.", flags: [] };
    }

    await recordAiUsage(access.userId, "Detect Plagiarism");
    return NextResponse.json({ ...parsed, truncated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong analyzing this document." }, { status: 500 });
  }
}
