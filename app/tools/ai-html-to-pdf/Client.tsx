"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import ResultPanel from "@/components/ResultPanel";
import AiDisclaimer from "@/components/AiDisclaimer";
import { htmlToPdf } from "@/lib/pdfTools";
import { downloadPdf } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { Upload, Wand2 } from "lucide-react";

const tool = getTool("ai-html-to-pdf")!;

const PLACEHOLDER = `<nav>Home | About | Contact</nav>
<div class="ad">Buy now! 50% off!</div>
<article>
  <h1>The actual thing I want</h1>
  <p>Paste messy HTML here — a full page source works fine. The clutter around the real content gets stripped out automatically.</p>
</article>
<footer>© Some Company. All rights reserved.</footer>`;

type Stage = "idle" | "cleaning" | "building" | "done" | "error";

export default function AiHtmlToPdfClient() {
  const [html, setHtml] = useState(PLACEHOLDER);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  useErrorToast(error);

  async function handleFile(file: File) {
    const text = await file.text();
    setHtml(text);
  }

  async function handleConvert() {
    setError(null);
    try {
      if (!html.trim()) throw new Error("Add some HTML content first.");
      setStage("cleaning");
      const res = await fetch("/api/ai-html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setStage("building");
      const bytes = await htmlToPdf(data.html);
      setResult(bytes);
      setStage("done");
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this HTML.");
      setStage("error");
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setStage("idle");
  }

  const busy = stage === "cleaning" || stage === "building";
  const stageLabel = { cleaning: "Cleaning up the HTML…", building: "Building the PDF…" }[stage as "cleaning" | "building"];

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {result ? (
          <>
            <ResultPanel title="Your PDF is ready" onDownload={() => downloadPdf(result, "converted.pdf")} onReset={reset} />
            <AiDisclaimer />
          </>
        ) : busy ? (
          <div className="paper-stack p-10 text-center">
            <Wand2 className="mx-auto text-violet-dark" size={22} />
            <p className="mt-3 text-sm text-ink-faint">{stageLabel}</p>
          </div>
        ) : (
          <div className="paper-stack p-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink">HTML content</label>
              <label className="inline-flex items-center gap-1.5 text-sm text-amber-dark font-medium cursor-pointer">
                <Upload size={14} /> Upload .html file
                <input type="file" accept=".html,text/html" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
            </div>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={12}
              className="mt-2 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
            />
            <p className="mt-2 text-xs text-ink-faint">
              Claude strips navigation, ads, and clutter, then reformats the real content with proper headings and
              structure before it's rendered to PDF.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <p className="mt-3 text-xs text-ink-faint text-center">
              Unlike the plain HTML to PDF tool, this one sends your HTML to a server for AI cleanup.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleConvert}
                className="rounded-md bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-dark"
              >
                Clean up &amp; convert
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
