"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, RotateCcw, Download } from "lucide-react";
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
  const fired = useRef(false);

  // Guard against React StrictMode double-invocation — only toast once.
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    toast.success(title);
    trackEvent("tool_success", { page: pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="paper-stack p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal-dark">
        <CheckCircle2 size={24} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      {detail && <p className="mt-1.5 text-base text-ink-faint">{detail}</p>}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
        >
          <Download size={16} /> {downloadLabel ?? t("download")}
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink transition-colors"
        >
          <RotateCcw size={16} /> {t("startOver")}
        </button>
      </div>
    </div>
  );
}
