"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function ContactForm() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!email.trim() || !message.trim()) {
      setError(t("contactError"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("contactError"));
      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? t("contactError"));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="paper-stack p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-light text-teal-dark">
          <Check size={20} />
        </div>
        <p className="mt-4 text-sm text-ink-faint">{t("contactSent")}</p>
      </div>
    );
  }

  return (
    <div className="paper-stack p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-ink">{t("contactName")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink">{t("contactEmail")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink">{t("contactMessage")}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      {error && <p className="text-sm text-rust-dark">{error}</p>}
      <button
        onClick={submit}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
      >
        <Send size={15} /> {busy ? t("contactSending") : t("contactSend")}
      </button>
    </div>
  );
}
