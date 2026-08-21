"use client";

import { useEffect, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { extractPdfText } from "@/lib/extractText";
import { renderPdfPages } from "@/lib/pdfRender";
import { FileSearch, RotateCcw, ShieldAlert, ShieldCheck, ShieldQuestion, FileText } from "lucide-react";
import AiDisclaimer from "@/components/AiDisclaimer";
import { useErrorToast } from "@/components/useErrorToast";
import { useToast } from "@/components/ToastProvider";
import { trackEvent } from "@/lib/analytics";

const tool = getTool("detect-plagiarism")!;

/** A small first-page thumbnail so the report header shows what was
 * actually uploaded, not just a filename. */
function FileThumb({ file }: { file: File }) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    renderPdfPages(file, 0.2, [0])
      .then((pages) => { if (!cancelled && pages[0]) setThumb(pages[0].dataUrl); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [file]);
  if (!thumb) {
    return (
      <span className="flex h-8 w-6 shrink-0 items-center justify-center rounded-sm border border-paper-line bg-white text-ink-faint">
        <FileText size={13} />
      </span>
    );
  }
  return <img src={thumb} alt="" className="h-8 w-6 shrink-0 rounded-sm border border-paper-line object-cover bg-white" />;
}

type Stage = "idle" | "reading" | "analyzing" | "done" | "error";

interface Flag {
  excerpt: string;
  reason: string;
}

interface Report {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  flags: Flag[];
  truncated: boolean;
}

const RISK_META = {
  low: { label: "Low risk", icon: ShieldCheck, className: "bg-teal-light text-teal-dark" },
  medium: { label: "Medium risk", icon: ShieldQuestion, className: "bg-amber-light text-amber-dark" },
  high: { label: "High risk", icon: ShieldAlert, className: "bg-rust-light text-rust-dark" },
} as const;

export default function DetectPlagiarismPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const toast = useToast();

  async function handleFile(f: File) {
    setFile(f);
    setError(null);
    setStage("reading");
    try {
      const extracted = await extractPdfText(f);
      if (!extracted.text.trim()) {
        throw new Error("Couldn't find any selectable text in this PDF — it may be a scanned image without OCR.");
      }
      setStage("analyzing");
      const res = await fetch("/api/pdf-plagiarism", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted.text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setReport(data);
      setStage("done");
      toast.success("Analysis ready.");
      trackEvent("tool_success", { page: "/tools/detect-plagiarism" });
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
      setStage("error");
    }
  }

  function reset() {
    setFile(null);
    setReport(null);
    setError(null);
    setStage("idle");
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {stage === "idle" ? (
          <>
            <Dropzone
              accept="application/pdf"
              label="Select a PDF to analyze"
              hint="Extracted text is sent to Claude to generate the report"
              onFiles={(files) => handleFile(files[0])}
            />
            <p className="mt-3 text-xs text-ink-faint text-center">
              Unlike the other tools here, this one sends document text to a server to generate the report.
            </p>
          </>
        ) : stage === "reading" || stage === "analyzing" ? (
          <div className="paper-stack p-10 text-center">
            <FileSearch className="mx-auto text-violet-dark" size={22} />
            <p className="mt-3 text-sm text-ink-faint">{stage === "reading" ? "Reading the PDF…" : "Analyzing writing patterns…"}</p>
          </div>
        ) : stage === "error" ? (
          <div className="paper-stack p-8 text-center">
            <p className="text-sm text-rust-dark">{error}</p>
            <button onClick={reset} className="mt-4 rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
              Try again
            </button>
          </div>
        ) : report ? (
          <div className="paper-stack p-6">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex min-w-0 items-center gap-2">
                {file && <FileThumb file={file} />}
                <p className="truncate text-sm font-mono text-ink-faint">{file?.name}</p>
              </div>
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink shrink-0">
                <RotateCcw size={12} /> New file
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {(() => {
                const meta = RISK_META[report.riskLevel] ?? RISK_META.low;
                const Icon = meta.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${meta.className}`}>
                    <Icon size={14} /> {meta.label}
                  </span>
                );
              })()}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink">{report.summary}</p>

            {report.flags.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Flagged passages</p>
                <ul className="mt-2 space-y-3">
                  {report.flags.map((flag, i) => (
                    <li key={i} className="rounded-md border border-paper-line bg-paper-dim/40 p-3">
                      <p className="text-sm italic text-ink">&ldquo;{flag.excerpt}&rdquo;</p>
                      <p className="mt-1.5 text-xs text-ink-faint">{flag.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AiDisclaimer />
            {report.truncated && (
              <p className="mt-4 text-xs text-ink-faint">
                This document was long, so the analysis is based on the first portion of the text.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
