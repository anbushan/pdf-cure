"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { pdfToPdfA } from "@/lib/pdfTools";
import { downloadBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("pdf-to-pdfa")!;

export default function PdfToPdfAPage() {
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
      const bytes = await pdfToPdfA(file);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this PDF.");
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
          <ResultPanel previewBytes={result}
            title="Converted to PDF/A"
            onDownload={() => downloadBytes(result, `${stripExt(file!.name)}_pdfa.pdf`, "application/pdf")}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />
            <p className="mt-3 text-xs text-ink-faint">
              Adds PDF/A-1B archival metadata and rebuilds the file cleanly. This is a best-effort conversion — it
              doesn't verify every font is embedded or attach a color profile, both of which strict validators (like
              veraPDF) check for. For legally mandated archival submissions, verify the result with a dedicated
              validator afterward.
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
                {busy ? "Converting…" : "Convert to PDF/A"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
