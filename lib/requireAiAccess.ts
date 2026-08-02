import { NextResponse } from "next/server";
import { getSession } from "./getSession";
import { getAiUsageStatus, recordAiUsage as recordUsage } from "./aiUsage";

/**
 * Pre-flight check for an AI route: must be signed in, and must not have
 * already exhausted today's quota for this feature. Checked (not consumed)
 * here so a failed Anthropic call below doesn't burn it — recordAiUsage()
 * is what actually claims it, called only after a successful response.
 */
export async function checkAiAccess(feature: string): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const session = await getSession();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in with Google to use this AI tool." }, { status: 401 }),
    };
  }
  const status = await getAiUsageStatus(session.user.id, feature);
  if (!status.available) {
    const message =
      status.plan === "pro"
        ? `You've used all ${status.limit} of today's actions for this tool. It resets at midnight UTC.`
        : "You've already used your one AI action for today. Upgrade to Pro for a much higher daily limit, or come back tomorrow.";
    return { ok: false, response: NextResponse.json({ error: message, plan: status.plan }, { status: 429 }) };
  }
  return { ok: true, userId: session.user.id };
}

export async function recordAiUsage(userId: string, feature: string): Promise<void> {
  await recordUsage(userId, feature);
}
