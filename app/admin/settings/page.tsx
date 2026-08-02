"use client";

import SettingsForm, { type SettingFieldMeta } from "@/components/admin/SettingsForm";

const KEYS = [
  "ANTHROPIC_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_GOOGLE_API_KEY",
  "NEXT_PUBLIC_GOOGLE_APP_ID",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

const LABELS: Record<string, SettingFieldMeta> = {
  ANTHROPIC_API_KEY: {
    label: "Anthropic API key",
    hint: "Powers the AI tools (Summarize, Ask your PDF, Translate). Get one at console.anthropic.com.",
  },
  GOOGLE_CLIENT_ID: {
    label: "Google OAuth client ID",
    hint: "Used for Google sign-in and the Google Drive file picker. From Google Cloud Console → Credentials.",
  },
  GOOGLE_CLIENT_SECRET: {
    label: "Google OAuth client secret",
    hint: "Pairs with the client ID above. Changing this signs out every current session, including yours.",
  },
  NEXT_PUBLIC_GOOGLE_API_KEY: {
    label: "Google Drive API key",
    hint: "Lets people import a file straight from Google Drive on every tool. Restrict it to the Picker API.",
  },
  NEXT_PUBLIC_GOOGLE_APP_ID: {
    label: "Google Cloud project number",
    hint: "The numeric project ID shown on your Google Cloud project's dashboard.",
  },
  RAZORPAY_KEY_ID: {
    label: "Razorpay Key ID",
    hint: "From the Razorpay dashboard → Settings → API Keys. Used client-side to open Checkout, so it's not secret.",
  },
  RAZORPAY_KEY_SECRET: {
    label: "Razorpay Key Secret",
    hint: "Pairs with the Key ID above — used server-side to create subscriptions and verify payments.",
  },
  RAZORPAY_WEBHOOK_SECRET: {
    label: "Razorpay Webhook Secret",
    hint: "From Razorpay dashboard → Webhooks → your webhook (URL: /api/razorpay/webhook) → the secret you set there.",
  },
};

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Configuration</h1>
      <p className="mt-1 text-sm text-ink-faint max-w-2xl">
        Overrides the matching environment variable immediately, no redeploy needed. Leave a field blank and save to
        clear the override and fall back to .env.
      </p>
      <div className="mt-6">
        <SettingsForm keys={KEYS} labels={LABELS} />
      </div>
    </div>
  );
}
