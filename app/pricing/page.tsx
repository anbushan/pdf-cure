"use client";

import { useEffect, useState } from "react";
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

export default function PricingPage() {
  const { data: session, status, update } = useSession();
  const toast = useToast();
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({}));
    fetch("/api/geo")
      .then((r) => r.json())
      .then((data) => setCurrency(data.currency ?? "INR"))
      .catch(() => setCurrency("INR"));
  }, []);

  const plan = session?.user?.plan ?? "free";
  const priceInr = parseInt(config?.PRO_PLAN_PRICE_INR ?? "499", 10);
  const freeLimit = config?.FREE_DAILY_LIMIT ?? "1";
  const proLimit = config?.PRO_DAILY_LIMIT_PER_FEATURE ?? "20";

  async function handleUpgrade() {
    if (status === "unauthenticated") {
      await signIn("google");
      return;
    }
    if (!config?.RAZORPAY_KEY_ID) {
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
      <div className="mx-auto max-w-4xl px-6 pt-6 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Simple pricing</h1>
        <p className="mt-3 text-lg text-ink-faint">
          Every editing tool is free forever, no account needed. Pro is only about the AI tools and removing ads.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
          {/* Free */}
          <div className="paper-stack p-8">
            <h2 className="font-display text-xl font-semibold text-ink">Free</h2>
            <p className="mt-1 text-3xl font-bold text-ink">₹0</p>
            <p className="mt-1 text-sm text-ink-faint">Forever</p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> Every editing &amp; conversion tool,
                unlimited, no account
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> {freeLimit} AI action per day (shared
                across all AI tools)
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> Google Drive import
              </li>
              <li className="flex items-start gap-2 text-ink-faint">
                <span className="mt-0.5 shrink-0">–</span> Ads shown
              </li>
            </ul>
            {plan === "free" && session && (
              <p className="mt-6 rounded-md bg-paper-dim px-3 py-2 text-center text-sm font-medium text-ink-faint">
                Your current plan
              </p>
            )}
          </div>

          {/* Pro */}
          <div className="paper-stack p-8 border-amber ring-1 ring-amber">
            <span className="eyebrow text-amber-dark">Pro</span>
            <p className="mt-2 text-3xl font-bold text-ink">
              {formatCurrency(priceInr, currency)}
              <span className="text-base font-normal text-ink-faint"> / month</span>
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              Cancel anytime{currency !== "INR" && ` · billed as ₹${priceInr} (INR) via Razorpay`}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> Everything in Free
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> {proLimit} AI actions per day, for{" "}
                <strong>each</strong> AI tool
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" /> No ads, anywhere on the site
              </li>
            </ul>

            {plan === "pro" ? (
              <div className="mt-6 space-y-2">
                <p className="rounded-md bg-teal-light px-3 py-2 text-center text-sm font-medium text-teal-dark">
                  You're on Pro
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink disabled:opacity-40"
                >
                  {cancelling ? "Cancelling…" : "Cancel subscription"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={busy || status === "loading"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {status === "unauthenticated" ? "Sign in to upgrade" : busy ? "Opening checkout…" : "Upgrade to Pro"}
              </button>
            )}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-lg text-xs text-ink-faint">
          Payments are processed by Razorpay. Subscriptions renew monthly until cancelled; cancelling keeps Pro access
          until the current billing period ends.
        </p>
      </div>
    </div>
  );
}
