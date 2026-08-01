"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import AiDisclaimer from "@/components/AiDisclaimer";
import { extractPdfText } from "@/lib/extractText";
import { downloadBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { useToast } from "@/components/ToastProvider";
import { trackEvent } from "@/lib/analytics";
import { FileCode, Copy, Download, RotateCcw, Check } from "lucide-react";

const tool = getTool("ai-pdf-to-html")!;

type Stage = "idle" | "reading" | "converting" | "done" | "error";

function wrapDocument(bodyHtml: string, title: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1a1a1a; }
  h1, h2, h3 { line-height: 1.25; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 6px 10px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export default function AiPdfToHtmlClient() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const [copied, setCopied] = useState(false);
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
      setStage("converting");
      const res = await fetch("/api/ai-pdf-to-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted.text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setBodyHtml(data.html);
      setStage("done");
      toast.success("HTML ready.");
      trackEvent("tool_success", { page: "/tools/ai-pdf-to-html" });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this PDF.");
      setStage("error");
    }
  }

  function reset() {
    setFile(null);
    setBodyHtml("");
    setError(null);
    setStage("idle");
  }

  const fullDoc = file ? wrapDocument(bodyHtml, stripExt(file.name)) : "";
  const busy = stage === "reading" || stage === "converting";

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {stage === "idle" ? (
          <>
            <Dropzone
              accept="application/pdf"
              label="Select a PDF to convert to HTML"
              hint="Extracted text is sent to Claude to generate structured HTML"
              onFiles={(files) => handleFile(files[0])}
            />
            <p className="mt-3 text-xs text-ink-faint text-center">
              Unlike the other tools here, this one sends document text to a server to generate the HTML.
            </p>
          </>
        ) : busy ? (
          <div className="paper-stack p-10 text-center">
            <FileCode className="mx-auto text-violet-dark" size={22} />
            <p className="mt-3 text-sm text-ink-faint">{stage === "reading" ? "Reading the PDF…" : "Structuring the content…"}</p>
          </div>
        ) : stage === "error" ? (
          <div className="paper-stack p-8 text-center">
            <p className="text-sm text-rust-dark">{error}</p>
            <button onClick={reset} className="mt-4 rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
              Try again
            </button>
          </div>
        ) : (
          <div>
            <div className="paper-stack overflow-hidden p-0">
              <iframe
                srcDoc={fullDoc}
                sandbox=""
                title="HTML preview"
                className="h-96 w-full bg-white"
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Preview shown in a sandboxed frame (no scripts run) — this is exactly what's in the downloaded file.
            </p>
            <AiDisclaimer />
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullDoc);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy HTML"}
              </button>
              <button
                onClick={() => downloadBytes(new TextEncoder().encode(fullDoc), `${stripExt(file!.name)}.html`, "text/html")}
                className="inline-flex items-center gap-2 rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink"
              >
                <Download size={14} /> Download .html
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
