import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  const { type, message, email, page } = (await req.json()) as {
    type?: string;
    message?: string;
    email?: string;
    page?: string;
  };

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Please add a message before sending." }, { status: 400 });
  }

  const result = await sendEmail({
    subject: `Feedback (${type || "General"}) from PDFCure`,
    replyTo: email || undefined,
    text: `Type: ${type || "General"}\nPage: ${page || "unknown"}\nFrom: ${email || "not given"}\n\n${message}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
