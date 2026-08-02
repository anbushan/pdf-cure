import Razorpay from "razorpay";
import { getSetting, setSetting } from "./settings";

export async function getRazorpayClient(): Promise<Razorpay | null> {
  const keyId = await getSetting("RAZORPAY_KEY_ID");
  const keySecret = await getSetting("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

const PLAN_NAME = "PDFCure Pro";
// Razorpay subscriptions need a finite total_count rather than "forever" —
// 10 years of monthly billing is effectively indefinite for this purpose;
// cancelling stops future charges regardless of how many cycles are left.
const TOTAL_BILLING_CYCLES = 120;

/**
 * Razorpay Plans are immutable once created, so changing the admin-set
 * price (PRO_PLAN_PRICE_INR) means creating a new Plan rather than editing
 * the old one. The current plan's id and the price it was created at are
 * cached in Settings; a mismatch means the price changed since, so a fresh
 * plan is created and cached. Existing subscribers stay on their original
 * plan/price until they cancel and resubscribe — no proration.
 */
export async function getOrCreateProPlanId(): Promise<string> {
  const client = await getRazorpayClient();
  if (!client) throw new Error("Razorpay isn't configured yet.");

  const price = await getSetting("PRO_PLAN_PRICE_INR");
  const priceRupees = parseInt(price ?? "499", 10);

  const [cachedPlanId, cachedPrice] = await Promise.all([
    getSetting("RAZORPAY_PLAN_ID"),
    getSetting("RAZORPAY_PLAN_ID_PRICE"),
  ]);
  if (cachedPlanId && cachedPrice === String(priceRupees)) {
    return cachedPlanId;
  }

  const plan = await client.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: PLAN_NAME,
      amount: priceRupees * 100, // paise
      currency: "INR",
    },
  });

  await setSetting("RAZORPAY_PLAN_ID", plan.id);
  await setSetting("RAZORPAY_PLAN_ID_PRICE", String(priceRupees));
  return plan.id;
}

export async function createSubscription(input: { userId: string; email: string; name: string }) {
  const client = await getRazorpayClient();
  if (!client) throw new Error("Razorpay isn't configured yet.");

  const planId = await getOrCreateProPlanId();
  return client.subscriptions.create({
    plan_id: planId,
    total_count: TOTAL_BILLING_CYCLES,
    customer_notify: true,
    notes: { userId: input.userId },
  });
}

export async function cancelSubscription(subscriptionId: string) {
  const client = await getRazorpayClient();
  if (!client) throw new Error("Razorpay isn't configured yet.");
  // cancel_at_cycle_end: true — access continues until the period already
  // paid for runs out, rather than cutting off immediately.
  return client.subscriptions.cancel(subscriptionId, true);
}

/** HMAC-SHA256 verification shared by both the checkout-success callback and the webhook — same algorithm, different payload shape. */
export function verifySignature(body: string, signature: string, secret: string): boolean {
  return Razorpay.validateWebhookSignature(body, signature, secret);
}
