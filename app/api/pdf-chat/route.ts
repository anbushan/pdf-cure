import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { checkAiAccess, recordAiUsage } from "@/lib/requireAiAccess";

const MAX_CHARS = 60000;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const access = await checkAiAccess();
  if (!access.ok) return access.response;

  try {
    const { text, question, history } = (await req.json()) as {
      text?: string;
      question?: string;
      history?: ChatTurn[];
    };

    if (!text || !text.trim() || !question || !question.trim()) {
      return NextResponse.json({ error: "Missing document text or question." }, { status: 400 });
    }
    const apiKey = await getSetting("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "The server is missing ANTHROPIC_API_KEY. Set it in the admin Configuration panel or .env." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const document = text.slice(0, MAX_CHARS);

    const system = `You answer questions about the document pasted below. Only use information that's actually in the document. If the answer isn't in there, say so plainly instead of guessing. Keep answers concise and direct.\n\n--- DOCUMENT START ---\n${document}\n--- DOCUMENT END ---`;

    // Keep a short rolling window of prior turns so context doesn't grow unbounded.
    const recentHistory = (history ?? [])
      .slice(-6)
      .filter((h) => h.role === "user" || h.role === "assistant")
      .map((h) => ({ role: h.role, content: h.content }));

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system,
      messages: [...recentHistory, { role: "user", content: question }],
    });

    const answer = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    await recordAiUsage(access.userId, "Ask your PDF");
    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Something went wrong answering that." }, { status: 500 });
  }
}
