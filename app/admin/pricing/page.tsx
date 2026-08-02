"use client";

import SettingsForm, { type SettingFieldMeta } from "@/components/admin/SettingsForm";

const KEYS = ["PRO_PLAN_PRICE_INR", "FREE_DAILY_LIMIT", "PRO_DAILY_LIMIT_PER_FEATURE"];

const LABELS: Record<string, SettingFieldMeta> = {
  PRO_PLAN_PRICE_INR: {
    label: "Pro plan price (₹/month)",
    hint: "Charged monthly via Razorpay. Changing this creates a new Razorpay Plan for future subscribers — people already subscribed keep their existing price until they cancel and resubscribe.",
    type: "number",
  },
  FREE_DAILY_LIMIT: {
    label: "Free plan: AI actions per day",
    hint: "Total across all AI tools combined (Summarize + Ask + Translate + AI HTML/PDF share this one pool).",
    type: "number",
  },
  PRO_DAILY_LIMIT_PER_FEATURE: {
    label: "Pro plan: AI actions per day, per tool",
    hint: "Each AI tool gets its own pool at this size (e.g. 20 lets someone use Summarize 20x and Ask 20x the same day).",
    type: "number",
  },
};

export default function AdminPricingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Pricing</h1>
      <p className="mt-1 text-sm text-ink-faint max-w-2xl">
        Controls what the /pricing page shows and what limits apply to each plan. Takes effect immediately.
      </p>

      <div className="mt-4 max-w-2xl rounded-md border border-paper-line bg-paper-dim px-4 py-3 text-xs leading-relaxed text-ink-faint">
        <strong className="text-ink">How the default price was set:</strong> Claude Sonnet is roughly $3 / $15 per
        million input/output tokens. A typical AI-tool request runs ~5,000 input + ~800 output tokens ≈ $0.03. An
        actively engaged Pro user realistically triggers maybe 5–10 AI calls a day (not the full 20×4 = 80/day
        ceiling), which works out to roughly $5–9/month in API cost. ₹499 (~$6) covers that plus AdSense revenue
        you'd otherwise earn from that person's pageviews, with room to spare. Adjust freely — this is a starting
        point, not a fixed formula.
      </div>

      <div className="mt-6">
        <SettingsForm keys={KEYS} labels={LABELS} />
      </div>
    </div>
  );
}
