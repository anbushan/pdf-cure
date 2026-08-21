"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { rotatePdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { RotateCcw, RotateCw } from "lucide-react";

const tool = getTool("rotate")!;

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
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
      const bytes = await rotatePdf(file, rotation);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't rotate this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setRotation(0);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Your PDF has been rotated"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_rotated.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to rotate" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            {loading ? (
              <p className="text-sm text-ink-faint py-16">Rendering preview…</p>
            ) : (
              <div className="flex justify-center py-4">
                <img
                  src={pages[0]?.dataUrl}
                  alt="Preview"
                  className="max-h-72 rounded shadow-card transition-transform duration-200"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                className="inline-flex items-center gap-2 rounded-md border border-paper-line px-4 py-2 text-sm font-medium hover:border-ink-faint"
              >
                <RotateCcw size={16} /> Left
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="inline-flex items-center gap-2 rounded-md border border-paper-line px-4 py-2 text-sm font-medium hover:border-ink-faint"
              >
                <RotateCw size={16} /> Right
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-faint">Applies to every page in the document.</p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={rotation === 0 || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Rotating…" : "Apply rotation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
