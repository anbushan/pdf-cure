"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { repairPdf, RepairResult } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("repair")!;

export default function RepairPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<RepairResult | null>(null);

  async function handleRepair() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await repairPdf(file);
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't repair this PDF.");
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
          <ResultPanel
            title={result.pagesRecovered < result.totalPages ? `Recovered ${result.pagesRecovered} of ${result.totalPages} pages` : "PDF rebuilt successfully"}
            detail={
              result.usedImageFallback
                ? "The file's structure was too damaged for a normal rebuild, so pages were recovered as images — text is no longer selectable."
                : undefined
            }
            onDownload={() => downloadPdf(result.bytes, `${stripExt(file!.name)}_repaired.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a damaged PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />
            <p className="mt-3 text-xs text-ink-faint">
              This rebuilds the PDF from scratch, which fixes most "can't open this file" errors caused by a broken
              cross-reference table or a corrupted incremental save. If the file's structure is too damaged to parse at
              all, this falls back to recovering each page as an image instead — you'll still get your content back, just
              without selectable text.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleRepair}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Repairing…" : "Repair PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
