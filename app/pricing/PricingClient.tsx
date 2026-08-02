"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/components/ToastProvider";
import { formatCurrency } from "@/lib/currency";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface PublicConfig {
  RAZORPAY_KEY_ID?: string;
  PRO_PLAN_PRICE_INR?: string;
  FREE_DAILY_LIMIT?: string;
  PRO_DAILY_LIMIT_PER_FEATURE?: string;
}

interface PlanView {
  id: string;
  name: string;
  description: string;
  priceInr: number;
  dailyAiLimit: number;
  features: string[];
  cta: "free" | "checkout" | "disabled";
  order: number;
  active: boolean;
}

function loadCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load the payment form. Check your connection and try again."));
    document.body.appendChild(script);
  });
}

interface PricingClientProps {
  config: PublicConfig;
  currency: string;
  plans: PlanView[];
}

/**
 * Plans render dynamically from the `plans` prop (admin-configurable —
 * see /admin/plans) instead of two hardcoded cards. The "checkout" plan
 * still displays the live Settings price (config.PRO_PLAN_PRICE_INR),
 * not its own stored priceInr — that Settings value is what Razorpay
 * actually charges, so showing anything else risks a price that doesn't
 * match the real charge if an admin edits the two independently.
 *
 * config/currency/plans all arrive as props, fetched server-side by
 * page.tsx — see that file's comment for why (avoids a fallback-price
 * flicker on every visit).
 */
export default function PricingPage({ config, currency, plans }: PricingClientProps) {
  const { data: session, status, update } = useSession();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const userPlan = session?.user?.plan ?? "free";
  const settingsPriceInr = parseInt(config.PRO_PLAN_PRICE_INR ?? "499", 10);

  async function handleUpgrade() {
    if (status === "unauthenticated") {
      await signIn("google");
      return;
    }
    if (!config.RAZORPAY_KEY_ID) {
      toast.error("Payments aren't set up on this site yet.");
      return;
    }
    setBusy(true);
    try {
      await loadCheckoutScript();
      const res = await fetch("/api/razorpay/create-subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't start checkout.");

      const razorpay = new window.Razorpay({
        key: config.RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "PDFCure Pro",
        description: "Monthly subscription",
        theme: { color: "#D97706" },
        prefill: { email: session?.user?.email ?? undefined, name: session?.user?.name ?? undefined },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Verification failed.");
            await update();
            toast.success("You're on Pro — thanks for upgrading!");
          } catch (e: any) {
            toast.error(e?.message ?? "Payment succeeded but we couldn't confirm it — contact support.");
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      razorpay.on("payment.failed", (resp: any) => {
        toast.error(resp?.error?.description ?? "Payment failed.");
        setBusy(false);
      });
      razorpay.open();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't start checkout.");
      setBusy(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/razorpay/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't cancel.");
      toast.success("Subscription cancelled — you'll keep Pro until the current period ends.");
      await update();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't cancel.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />
      <div className="mx-auto max-w-5xl px-6 pt-6 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Simple pricing</h1>
        <p className="mt-3 text-lg text-ink-faint">
          Every editing tool is free forever, no account needed. Pro is only about the AI tools and removing ads.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCheckout = plan.cta === "checkout";
            const displayPriceInr = isCheckout ? settingsPriceInr : plan.priceInr;
            const isCurrent = session && ((plan.cta === "free" && userPlan === "free") || (isCheckout && userPlan === "pro"));

            return (
              <div
                key={plan.id}
                className={`paper-stack p-8 ${isCheckout ? "border-amber ring-1 ring-amber" : ""}`}
              >
                {isCheckout ? (
                  <span className="eyebrow text-amber-dark">{plan.name}</span>
                ) : (
                  <h2 className="font-display text-xl font-semibold text-ink">{plan.name}</h2>
                )}
                <p className={isCheckout ? "mt-2 text-3xl font-bold text-ink" : "mt-1 text-3xl font-bold text-ink"}>
                  {displayPriceInr === 0 ? "₹0" : formatCurrency(displayPriceInr, currency)}
                  {displayPriceInr > 0 && <span className="text-base font-normal text-ink-faint"> / month</span>}
                </p>
                <p className="mt-1 text-sm text-ink-faint">
                  {plan.description}
                  {isCheckout && currency !== "INR" && ` · billed as ₹${settingsPriceInr} (INR) via Razorpay`}
                </p>

                {plan.features.length > 0 && (
                  <ul className="mt-6 space-y-3 text-sm text-ink">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {isCurrent && (
                  <p
                    className={`mt-6 rounded-md px-3 py-2 text-center text-sm font-medium ${
                      isCheckout ? "bg-teal-light text-teal-dark" : "bg-paper-dim text-ink-faint"
                    }`}
                  >
                    {isCheckout ? "You're on Pro" : "Your current plan"}
                  </p>
                )}

                {isCheckout && userPlan === "pro" ? (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="mt-2 w-full rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink disabled:opacity-40"
                  >
                    {cancelling ? "Cancelling…" : "Cancel subscription"}
                  </button>
                ) : isCheckout ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={busy || status === "loading"}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
                  >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    {status === "unauthenticated" ? "Sign in to upgrade" : busy ? "Opening checkout…" : `Upgrade to ${plan.name}`}
                  </button>
                ) : plan.cta === "disabled" ? (
                  <button disabled className="mt-6 w-full cursor-not-allowed rounded-md border border-paper-line px-4 py-2.5 text-sm font-medium text-ink-faint opacity-60">
                    Coming soon
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-xs text-ink-faint">
          Payments are processed by Razorpay. Subscriptions renew monthly until cancelled; cancelling keeps Pro access
          until the current billing period ends.
        </p>
      </div>
    </div>
  );
}
