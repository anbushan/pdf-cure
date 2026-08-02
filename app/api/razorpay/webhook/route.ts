import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { verifySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

/**
 * Durable source of truth for subscription lifecycle — unlike the
 * checkout-success callback (app/api/razorpay/verify), this fires even if
 * the user closes their browser mid-checkout, and it's what confirms
 * renewals (subscription.charged) each billing cycle. Configure this URL
 * (yourdomain.com/api/razorpay/webhook) in the Razorpay dashboard →
 * Webhooks, subscribed to at least: subscription.charged,
 * subscription.cancelled, subscription.halted, payment.failed.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const webhookSecret = await getSetting("RAZORPAY_WEBHOOK_SECRET");

  if (!webhookSecret || !signature || !verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: {
      subscription?: { entity: { id: string; current_end?: number; status?: string } };
      payment?: { entity: { id: string; amount: number; currency: string; status: string; order_id?: string } };
    };
  };

  const subscriptionId = event.payload.subscription?.entity.id;
  const payment = event.payload.payment?.entity;

  switch (event.event) {
    case "subscription.charged": {
      if (!subscriptionId) break;
      const user = await prisma.user.findUnique({ where: { razorpaySubscriptionId: subscriptionId } });
      if (!user) break;

      const currentEnd = event.payload.subscription?.entity.current_end;
      const expiresAt = currentEnd ? new Date(currentEnd * 1000) : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        ...(payment
          ? [
              prisma.payment.upsert({
                where: { razorpayPaymentId: payment.id },
                update: { status: payment.status },
                create: {
                  userId: user.id,
                  razorpayPaymentId: payment.id,
                  razorpaySubscriptionId: subscriptionId,
                  amount: payment.amount,
                  currency: payment.currency,
                  status: payment.status,
                  plan: "pro",
                  notes: "webhook:subscription.charged",
                },
              }),
            ]
          : []),
        prisma.user.update({ where: { id: user.id }, data: { plan: "pro", planExpiresAt: expiresAt } }),
      ]);
      break;
    }

    case "subscription.halted": {
      // Razorpay exhausted retries — the subscription is effectively dead, so revoke access now rather than waiting for natural expiry.
      if (!subscriptionId) break;
      await prisma.user.updateMany({
        where: { razorpaySubscriptionId: subscriptionId },
        data: { plan: "free", planExpiresAt: null },
      });
      break;
    }

    case "payment.failed": {
      if (!payment) break;
      const user = subscriptionId ? await prisma.user.findUnique({ where: { razorpaySubscriptionId: subscriptionId } }) : null;
      if (!user) break;
      await prisma.payment.upsert({
        where: { razorpayPaymentId: payment.id },
        update: { status: "failed" },
        create: {
          userId: user.id,
          razorpayPaymentId: payment.id,
          razorpaySubscriptionId: subscriptionId,
          amount: payment.amount,
          currency: payment.currency,
          status: "failed",
          plan: "pro",
          notes: "webhook:payment.failed",
        },
      });
      break;
    }

    case "subscription.cancelled":
      // No immediate action — cancelSubscription() already set cancel-at-cycle-end on
      // the Razorpay side, and planExpiresAt naturally lapses at the paid-through date.
      break;

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
