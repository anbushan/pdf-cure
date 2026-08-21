"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { checkAccessibility, type AccessibilityReport, type AccessibilityCheck } from "@/lib/pdfTools";
import { useErrorToast } from "@/components/useErrorToast";
import { useToast } from "@/components/ToastProvider";
import { trackEvent } from "@/lib/analytics";
import { CheckCircle2, AlertTriangle, XCircle, Info, RotateCcw } from "lucide-react";

const tool = getTool("accessibility-checker")!;

const STATUS_STYLE = {
  pass: { icon: CheckCircle2, color: "text-teal-dark", bg: "bg-teal-light" },
  warn: { icon: AlertTriangle, color: "text-amber-dark", bg: "bg-amber-light" },
  fail: { icon: XCircle, color: "text-rust-dark", bg: "bg-rust-light" },
  info: { icon: Info, color: "text-ink-faint", bg: "bg-paper-dim" },
} as const;

function tally(checks: AccessibilityCheck[]) {
  const out = { pass: 0, warn: 0, fail: 0, info: 0 };
  for (const c of checks) out[c.status]++;
  return out;
}

export default function AccessibilityCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const toast = useToast();
  const [report, setReport] = useState<AccessibilityReport | null>(null);

  async function handleFile(f: File) {
    setFile(f);
    setBusy(true);
    setError(null);
    try {
      const res = await checkAccessibility(f);
      setReport(res);
      toast.success("Scan complete.");
      trackEvent("tool_success", { page: "/tools/accessibility-checker" });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't scan this PDF.");
      setFile(null);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setReport(null);
    setError(null);
  }

  const counts = report ? tally(report.checks) : null;

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {report && counts ? (
          <div>
            <div className="paper-stack p-5 mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-semibold text-ink">
                  {file?.name} · {report.pageCount} page{report.pageCount === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {counts.fail > 0 ? `${counts.fail} issue${counts.fail === 1 ? "" : "s"} found` : "No blocking issues found"}
                  {counts.warn > 0 ? ` · ${counts.warn} warning${counts.warn === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-xs font-medium text-ink-faint hover:text-ink"
              >
                <RotateCcw size={12} /> Scan another file
              </button>
            </div>

            <div className="space-y-3">
              {report.checks.map((c) => {
                const s = STATUS_STYLE[c.status];
                const Icon = s.icon;
                return (
                  <div key={c.id} className="paper-stack p-4 flex gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.bg} ${s.color}`}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{c.label}</p>
                      <p className="mt-0.5 text-sm text-ink-faint leading-relaxed">{c.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-xs text-ink-faint">
              This is a best-effort automated scan, not a full WCAG or PDF/UA conformance audit — see the FAQ below for what it does and doesn't verify.
            </p>
          </div>
        ) : busy ? (
          <div className="paper-stack p-10 text-center">
            <p className="text-sm text-ink-faint">Scanning…</p>
          </div>
        ) : (
          <Dropzone
            accept="application/pdf"
            label="Select a PDF to scan"
            hint="Checked entirely in your browser — nothing is uploaded"
            onFiles={(files) => handleFile(files[0])}
          />
        )}
      </div>
    </div>
  );
}
