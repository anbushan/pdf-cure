import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { cancelSubscription } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

/**
 * Deletes the signed-in account and everything tied to it. Sessions,
 * OAuth accounts, AI usage history, and payment records all cascade-delete
 * with the User row (see prisma/schema.prisma) — feedback submissions are
 * intentionally not linked to a user, so they're unaffected.
 */
export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.razorpaySubscriptionId) {
    try {
      // Immediate cancellation, not at-cycle-end — the account won't exist to keep serving.
      await cancelSubscription(user.razorpaySubscriptionId, false);
    } catch {
      // Best-effort: still delete the account even if Razorpay is unreachable
      // or the subscription was already cancelled/expired on their end.
    }
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
