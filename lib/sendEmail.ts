interface SendEmailInput {
  subject: string;
  replyTo?: string;
  text: string;
}

/**
 * Sends email via Resend (resend.com). Chosen over raw SMTP because it
 * works with a single API call and a free tier, with no mail server to
 * run. Swap this implementation if you'd rather use something else —
 * it's the only place that needs to change.
 */
export async function sendEmail({ subject, replyTo, text }: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "PDFCure <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return { ok: false, error: "Email isn't configured yet. Set RESEND_API_KEY and CONTACT_TO_EMAIL in .env.local." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Email provider error: ${body}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Couldn't send the email." };
  }
}
