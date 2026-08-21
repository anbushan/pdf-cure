"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { powerPointToPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("powerpoint-to-pdf")!;

export default function PowerpointToPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  useErrorToast(error);

  async function handleConvert() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await powerPointToPdf(file);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this file. Make sure it's a .pptx file.");
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
          <ResultPanel previewBytes={result} title="Your PDF is ready" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}.pdf`)} onReset={reset} />
        ) : !file ? (
          <Dropzone accept=".pptx" label="Select a .pptx file" hint="Only the .pptx format is supported (not the older .ppt)" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />
            <p className="mt-3 text-xs text-ink-faint">
              This pulls the text out of each slide and lays it out as one PDF page per slide. Shapes, precise
              positioning, images, and slide design don't carry over — it's a text-content extraction, not a visual
              copy of your deck.
            </p>
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
