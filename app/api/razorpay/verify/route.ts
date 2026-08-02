import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { getSetting } from "@/lib/settings";
import { verifySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

const ONE_CYCLE_MS = 31 * 24 * 60 * 60 * 1000;

/**
 * Called right after Razorpay Checkout's success callback, as an
 * immediate/optimistic confirmation so the user doesn't have to wait for
 * the webhook to see their Pro access unlock. The webhook (see
 * app/api/razorpay/webhook/route.ts) is still the durable source of
 * truth for renewals — this just gets the first grant in fast.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = (await req.json()) as {
    razorpay_payment_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature?: string;
  };
  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing verification fields." }, { status: 400 });
  }

  const keySecret = await getSetting("RAZORPAY_KEY_SECRET");
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay isn't configured." }, { status: 500 });
  }

  const valid = verifySignature(`${razorpay_payment_id}|${razorpay_subscription_id}`, razorpay_signature, keySecret);
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const priceRupees = parseInt((await getSetting("PRO_PLAN_PRICE_INR")) ?? "499", 10);
  const expiresAt = new Date(Date.now() + ONE_CYCLE_MS);

  await prisma.$transaction([
    prisma.payment.upsert({
      where: { razorpayPaymentId: razorpay_payment_id },
      update: { status: "captured" },
      create: {
        userId: session.user.id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySubscriptionId: razorpay_subscription_id,
        amount: priceRupees * 100,
        currency: "INR",
        status: "captured",
        plan: "pro",
        notes: "checkout-verify",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "pro", planExpiresAt: expiresAt, razorpaySubscriptionId: razorpay_subscription_id },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
