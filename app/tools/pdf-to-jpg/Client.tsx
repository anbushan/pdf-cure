"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { renderPdfPages } from "@/lib/pdfRender";
import { stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("pdf-to-jpg")!;

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<{ blob: Blob; count: number } | null>(null);

  async function handleConvert() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const rendered = await renderPdfPages(file, 2, undefined, 0.9);
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      rendered.forEach((p) => {
        const base64 = p.dataUrl.split(",")[1];
        zip.file(`${stripExt(file.name)}_page${p.index + 1}.jpg`, base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      setResult({ blob, count: rendered.length });
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
          <ResultPanel
            title="Your PDF has been converted"
            detail={`${result.count} JPG image${result.count === 1 ? "" : "s"}, zipped together`}
            downloadLabel="Download .zip"
            onDownload={() => saveAs(result.blob, `${stripExt(file?.name ?? "pages")}.zip`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to convert" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <p className="text-sm font-mono text-ink-faint">{file.name}</p>
            <p className="mt-3 text-sm text-ink-faint">Each page will be exported as a high-resolution JPG, bundled into a zip.</p>
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
                {busy ? "Converting…" : "Convert to JPG"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
