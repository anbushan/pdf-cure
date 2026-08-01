import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  const { name, email, message } = (await req.json()) as { name?: string; email?: string; message?: string };

  if (!email || !message || !message.trim()) {
    return NextResponse.json({ error: "Please include your email and a message." }, { status: 400 });
  }

  const result = await sendEmail({
    subject: `Contact form: ${name || "Someone"} on PDFCure`,
    replyTo: email,
    text: `From: ${name || "Not given"} <${email}>\n\n${message}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
