"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { flattenPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("flatten-pdf")!;

export default function FlattenPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleFlatten() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await flattenPdf(file);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't flatten this PDF.");
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
            title="Your PDF has been flattened"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_flattened.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF with form fields" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />
            <p className="mt-3 text-xs text-ink-faint">
              Every fillable field's current value gets drawn permanently onto the page, and the fields themselves are
              removed — the result can no longer be edited as a form.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleFlatten}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Flattening…" : "Flatten PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
