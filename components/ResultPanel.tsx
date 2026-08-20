"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, RotateCcw, Download, Sparkle } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useToast } from "./ToastProvider";
import { trackEvent } from "@/lib/analytics";

interface ResultPanelProps {
  title: string;
  detail?: string;
  onDownload: () => void;
  onReset: () => void;
  downloadLabel?: string;
}

export default function ResultPanel({ title, detail, onDownload, onReset, downloadLabel }: ResultPanelProps) {
  const { t } = useLanguage();
  const toast = useToast();
  const pathname = usePathname();
  const { status } = useSession();
  const fired = useRef(false);

  // Guard against React StrictMode double-invocation — only toast once.
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    toast.success(title);
    trackEvent("tool_success", { page: pathname });

    // "My Downloads" / "Recent Activity" under /account — tool + timestamp
    // only, never the file. Best-effort: signed-out visitors (most tool
    // usage) are never logged, and a failed request here shouldn't affect
    // the tool itself, so errors are swallowed.
    if (status === "authenticated") {
      const slug = pathname?.split("/")[2];
      if (slug) {
        fetch("/api/account/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: slug }),
        }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="result-pop paper-stack p-8 text-center sm:p-10">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <span className="result-ring absolute inset-0 rounded-full bg-teal-light" aria-hidden="true" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-light text-teal-dark shadow-sm">
          <CheckCircle2 size={30} />
        </span>
      </div>

      <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{title}</h3>

      {detail && (
        <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1 text-sm text-ink-faint">
          <Sparkle size={12} className="text-amber-dark" />
          {detail}
        </span>
      )}

      <div className="mt-7 flex flex-col items-center gap-3">
        <button
          onClick={onDownload}
          className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-md bg-amber px-6 py-3.5 text-base font-semibold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-dark hover:shadow-md active:translate-y-0 sm:w-auto"
        >
          <Download size={18} /> {downloadLabel ?? t("download")}
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
        >
          <RotateCcw size={13} /> {t("startOver")}
        </button>
      </div>
    </div>
  );
}
