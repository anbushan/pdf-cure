"use client";

import { useEffect, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { extractPdfText } from "@/lib/extractText";
import { renderPdfPages } from "@/lib/pdfRender";
import { downloadBytes, stripExt } from "@/lib/download";
import { Copy, Download, RotateCcw, Sparkles, Check, FileText } from "lucide-react";
import AiDisclaimer from "@/components/AiDisclaimer";
import { useErrorToast } from "@/components/useErrorToast";
import { useToast } from "@/components/ToastProvider";
import { trackEvent } from "@/lib/analytics";

const tool = getTool("summarize")!;

/** A small first-page thumbnail so the summary header shows what was
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

type Stage = "idle" | "reading" | "summarizing" | "done" | "error";

export default function SummarizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [summary, setSummary] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function handleFile(f: File) {
    setFile(f);
    setError(null);
    setStage("reading");
    try {
      const extracted = await extractPdfText(f);
      if (!extracted.text.trim()) {
        throw new Error("Couldn't find any selectable text in this PDF — it may be a scanned image without OCR.");
      }
      setStage("summarizing");
      const res = await fetch("/api/pdf-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted.text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSummary(data.summary);
      setTruncated(Boolean(data.truncated) || extracted.truncated);
      setStage("done");
      toast.success("Summary ready.");
      trackEvent("tool_success", { page: "/tools/summarize" });
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
      setStage("error");
    }
  }

  function reset() {
    setFile(null);
    setSummary("");
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
              label="Select a PDF to summarize"
              hint="Extracted text is sent to Claude to generate the summary"
              onFiles={(files) => handleFile(files[0])}
            />
            <p className="mt-3 text-xs text-ink-faint text-center">
              Unlike the other tools here, this one sends document text to a server to generate the summary.
            </p>
          </>
        ) : stage === "reading" || stage === "summarizing" ? (
          <div className="paper-stack p-10 text-center">
            <Sparkles className="mx-auto text-violet-dark" size={22} />
            <p className="mt-3 text-sm text-ink-faint">{stage === "reading" ? "Reading the PDF…" : "Summarizing…"}</p>
          </div>
        ) : stage === "error" ? (
          <div className="paper-stack p-8 text-center">
            <p className="text-sm text-rust-dark">{error}</p>
            <button onClick={reset} className="mt-4 rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
              Try again
            </button>
          </div>
        ) : (
          <div className="paper-stack p-6">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              {file && <FileThumb file={file} />}
              <p className="truncate text-sm font-mono text-ink-faint">{file?.name}</p>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{summary}</div>
            <AiDisclaimer />
            {truncated && (
              <p className="mt-4 text-xs text-ink-faint">
                This document was long, so the summary is based on the first portion of the text.
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => downloadBytes(new TextEncoder().encode(summary), `${stripExt(file!.name)}_summary.txt`, "text/plain")}
                className="inline-flex items-center gap-2 rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink"
              >
                <Download size={14} /> Download .txt
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-semibold text-white hover:bg-violet-dark"
              >
                <RotateCcw size={14} /> Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
