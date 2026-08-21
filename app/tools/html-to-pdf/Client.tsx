"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import ResultPanel from "@/components/ResultPanel";
import { htmlToPdf } from "@/lib/pdfTools";
import { downloadPdf } from "@/lib/download";
import { Upload } from "lucide-react";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("html-to-pdf")!;

const PLACEHOLDER = `<h1>Hello world</h1>\n<p>Paste any HTML here, or upload an .html file below.</p>`;

export default function HtmlToPdfPage() {
  const [html, setHtml] = useState(PLACEHOLDER);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    setHtml(text);
  }

  async function handleConvert() {
    setBusy(true);
    setError(null);
    try {
      if (!html.trim()) throw new Error("Add some HTML content first.");
      const bytes = await htmlToPdf(html);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this HTML.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result} title="Your HTML has been converted" onDownload={() => downloadPdf(result, "converted.pdf")} onReset={reset} />
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
              className="mt-2 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
            />
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleConvert}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Converting…" : "Convert to PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
