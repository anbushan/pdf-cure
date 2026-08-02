"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { addWatermark } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("watermark")!;

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (!text.trim()) throw new Error("Enter watermark text.");
      const bytes = await addWatermark(file, {
        text,
        opacity,
        fontSize,
        rotation,
        color: [0.11, 0.13, 0.16],
      });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't add the watermark.");
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
            title="Watermark applied"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_watermarked.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to watermark" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 space-y-5">
            <FilePreview file={file} />
            <div>
              <label className="text-sm font-medium text-ink">Watermark text</label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Opacity — {Math.round(opacity * 100)}%</label>
              <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1.5 w-full accent-amber-dark" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Font size — {fontSize}pt</label>
              <input type="range" min={12} max={120} step={2} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="mt-1.5 w-full accent-amber-dark" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Rotation — {rotation}°</label>
              <input type="range" min={0} max={360} step={5} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="mt-1.5 w-full accent-amber-dark" />
            </div>
            {error && <p className="text-sm text-rust-dark">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Add watermark"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
