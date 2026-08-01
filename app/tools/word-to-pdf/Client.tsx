"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { wordToPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("word-to-pdf")!;

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleConvert() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await wordToPdf(file);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this document. Make sure it's a .docx file.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel title="Your document has been converted" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}.pdf`)} onReset={reset} />
        ) : !file ? (
          <Dropzone accept=".docx" label="Select a .docx file" hint="Only the .docx format is supported (not the older .doc)" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <p className="text-sm font-mono text-ink-faint">{file.name}</p>
            <p className="mt-3 text-xs text-ink-faint">Text, headings, lists, and basic formatting carry over. Complex layouts may shift slightly.</p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
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
