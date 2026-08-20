"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { extractImagesFromPdf } from "@/lib/pdfTools";
import { stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("extract-images")!;

export default function ExtractImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<{ blob: Blob; count: number } | null>(null);

  async function handleExtract() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const images = await extractImagesFromPdf(file);
      if (images.length === 0) {
        throw new Error("Couldn't find any embedded images in this PDF — it may be text-only, or built entirely from vector shapes.");
      }
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const perPage = new Map<number, number>();
      images.forEach((img) => {
        const n = (perPage.get(img.pageIndex) ?? 0) + 1;
        perPage.set(img.pageIndex, n);
        zip.file(`${stripExt(file.name)}_p${img.pageIndex + 1}_${n}.png`, img.bytes);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      setResult({ blob, count: images.length });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't extract images from this PDF.");
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
            title="Images extracted"
            detail={`${result.count} image${result.count === 1 ? "" : "s"}, zipped together`}
            downloadLabel="Download .zip"
            onDownload={() => saveAs(result.blob, `${stripExt(file?.name ?? "images")}.zip`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6">
            <FilePreview file={file} />
            <p className="mt-4 text-sm text-ink-faint">
              Every embedded photo and logo will be pulled out at its original resolution and delivered as a zip of PNG files.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={busy}
                className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
              >
                {busy ? "Extracting…" : "Extract images"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
