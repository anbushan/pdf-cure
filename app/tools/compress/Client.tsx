"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { compressPdf, CompressResult } from "@/lib/pdfTools";
import { downloadPdf, formatBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("compress")!;

const LEVELS = [
  { id: "low", label: "Low", detail: "Best quality, smaller savings" },
  { id: "medium", label: "Recommended", detail: "Balanced quality and size" },
  { id: "high", label: "High", detail: "Smallest file, lower image quality" },
] as const;

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<CompressResult | null>(null);

  async function handleCompress() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await compressPdf(file, level);
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't compress this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  const savings = result ? Math.round((1 - result.newSize / result.originalSize) * 100) : 0;

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title={savings > 0 ? `Reduced by ${savings}%` : "Compression complete"}
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)}`}
            onDownload={() => downloadPdf(result.bytes, `${stripExt(file!.name)}_compressed.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to compress" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6">
            <FilePreview file={file} className="mb-4" />
            <p className="mt-4 text-sm font-medium text-ink">Compression level</p>
            <div className="mt-2 space-y-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`w-full flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors ${
                    level === l.id ? "border-amber bg-amber-light/40" : "border-paper-line hover:border-ink-faint/40"
                  }`}
                >
                  <span className="text-sm font-medium text-ink">{l.label}</span>
                  <span className="text-xs text-ink-faint">{l.detail}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              Compression re-renders each page as an image, so it works best on documents that are mostly text or scans. Vector graphics and selectable text will become part of the flattened image.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleCompress}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Compressing…" : "Compress PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
