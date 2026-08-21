"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { addWatermark } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("watermark")!;
const PREVIEW_SCALE = 0.6;

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, PREVIEW_SCALE);

  // Same watermark is stamped on every page, so the font-size scaling only
  // needs whichever page is currently previewed.
  const pageWidthPt = pages[pageIndex] ? pages[pageIndex].width / PREVIEW_SCALE : null;
  const fontSizeCqw = pageWidthPt ? (fontSize / pageWidthPt) * 100 : 6;

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
    setPageIndex(0);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Watermark applied"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_watermarked.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to watermark" onFiles={(f) => setFile(f[0])} />
        ) : loading ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering preview…</p>
        ) : (
          <div className="paper-stack p-6 space-y-5">
            {pages.length > 1 && (
              <div>
                <label className="text-sm font-medium text-ink">Preview page</label>
                <select
                  value={pageIndex}
                  onChange={(e) => setPageIndex(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                >
                  {pages.map((p) => (
                    <option key={p.index} value={p.index}>
                      Page {p.index + 1}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-ink-faint">The watermark is stamped on every page — this just shows how it lands on each one.</p>
              </div>
            )}

            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded border border-paper-line" style={{ containerType: "inline-size" } as React.CSSProperties}>
              <img src={pages[pageIndex]?.dataUrl} alt="Page preview" className="block w-full rounded" />
              {text && (
                <div
                  className="absolute left-1/2 top-1/2 whitespace-nowrap pointer-events-none"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                    fontSize: `${fontSizeCqw}cqw`,
                    opacity,
                    color: "#1c2129",
                    fontWeight: 700,
                    fontFamily: "Helvetica, Arial, sans-serif",
                  }}
                >
                  {text}
                </div>
              )}
            </div>

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
