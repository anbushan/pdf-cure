"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X, Check } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function FeedbackButton() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const TYPES: { key: "feedbackBug" | "feedbackIdea" | "feedbackOther"; value: string }[] = [
    { key: "feedbackBug", value: "Bug" },
    { key: "feedbackIdea", value: "Idea" },
    { key: "feedbackOther", value: "Something else" },
  ];

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [typeIdx, setTypeIdx] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => setMounted(true), []);

  const suppressed = pathname?.startsWith("/admin") || pathname?.startsWith("/scan/");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function reset() {
    setTypeIdx(0);
    setMessage("");
    setEmail("");
    setError(null);
    setSent(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function submit() {
    if (!message.trim()) {
      setError(t("feedbackErrorEmpty"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: TYPES[typeIdx].value, message, email, page: pathname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("feedbackErrorEmpty"));
      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? t("feedbackErrorEmpty"));
    } finally {
      setBusy(false);
    }
  }

  const modal = open && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4"
      onClick={close}
    >
      <div className="w-full max-w-sm paper-stack p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-ink">
            {sent ? t("feedbackThanks") : t("feedbackTitle")}
          </h2>
          <button onClick={close} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-light text-teal-dark">
              <Check size={18} />
            </div>
            <p className="mt-3 text-sm text-ink-faint">{t("feedbackThanksBody")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {TYPES.map((item, i) => (
                <button
                  key={item.key}
                  onClick={() => setTypeIdx(i)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    typeIdx === i ? "border-amber bg-amber-light/40 text-ink" : "border-paper-line text-ink-faint hover:border-ink-faint/40"
                  }`}
                >
                  {t(item.key)}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("feedbackPlaceholder")}
              className="w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("feedbackEmailPlaceholder")}
              className="w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
            {error && <p className="text-xs text-rust-dark">{error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="w-full rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
            >
              {busy ? t("feedbackSending") : t("feedbackSend")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (suppressed) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={t("feedback")}
        aria-label={t("feedback")}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-card transition-transform hover:scale-105 hover:bg-ink-soft"
      >
        <MessageSquarePlus size={20} />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
