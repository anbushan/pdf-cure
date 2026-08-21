"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { cropPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("crop")!;

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [margin, setMargin] = useState(10);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const { pages, loading } = usePdfThumbnails(file, 0.6);

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await cropPdf(file, margin);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't crop this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setMargin(10);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Your PDF has been cropped"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_cropped.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to crop" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            {loading ? (
              <p className="text-sm text-ink-faint py-16">Rendering preview…</p>
            ) : (
              <div className="relative mx-auto flex max-h-72 justify-center py-4">
                <div className="relative inline-block">
                  <img src={pages[0]?.dataUrl} alt="Preview" className="max-h-72 rounded shadow-card opacity-40" />
                  <div
                    className="absolute border-2 border-amber-dark bg-amber/10"
                    style={{
                      top: `${margin}%`,
                      left: `${margin}%`,
                      right: `${margin}%`,
                      bottom: `${margin}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <label className="mt-4 block text-sm font-medium text-ink">Margin to trim — {margin}%</label>
            <input type="range" min={0} max={40} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="mt-1.5 w-full accent-amber-dark" />
            <p className="mt-2 text-xs text-ink-faint">Trims an equal margin from all four sides of every page.</p>
            {error && <p className="mt-2 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={busy || margin === 0}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Cropping…" : "Crop PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
