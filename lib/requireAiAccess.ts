import { NextResponse } from "next/server";
import { getSession } from "./getSession";
import { getAiUsageStatus, tryConsumeAiUsage } from "./aiUsage";

/**
 * Pre-flight check for an AI route: must be signed in, and must not have
 * already used today's one AI action. Checked (not consumed) here so a
 * failed Anthropic call below doesn't burn the user's daily quota —
 * recordAiUsage() is what actually claims it, called only after success.
 */
export async function checkAiAccess(): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const session = await getSession();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in with Google to use this AI tool." }, { status: 401 }),
    };
  }
  const status = await getAiUsageStatus(session.user.id);
  if (!status.available) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You've already used your one AI action for today. It resets at midnight UTC." },
        { status: 429 }
      ),
    };
  }
  return { ok: true, userId: session.user.id };
}

/** Call once the AI response has actually been generated, to claim today's quota. */
export async function recordAiUsage(userId: string, feature: string): Promise<void> {
  await tryConsumeAiUsage(userId, feature);
}
