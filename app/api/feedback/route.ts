import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  await prisma.feedback.create({
    data: {
      type: type || "General",
      message: message.trim(),
      email: email?.trim() || null,
      page: page || null,
    },
  });

  // Best-effort: the feedback is already saved above regardless of whether
  // email is configured or the send succeeds, so a Resend hiccup doesn't
  // lose the submission — it just won't also land in an inbox.
  await sendEmail({
    subject: `Feedback (${type || "General"}) from PDFCure`,
    replyTo: email || undefined,
    text: `Type: ${type || "General"}\nPage: ${page || "unknown"}\nFrom: ${email || "not given"}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}
