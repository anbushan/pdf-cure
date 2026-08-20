"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { placeTextOnPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("add-text")!;
const PREVIEW_SCALE = 0.6;

const COLORS: { label: string; value: [number, number, number]; swatch: string }[] = [
  { label: "Black", value: [0.11, 0.13, 0.16], swatch: "#1c2129" },
  { label: "Red", value: [0.75, 0.11, 0.11], swatch: "#bf1c1c" },
  { label: "Blue", value: [0.1, 0.25, 0.65], swatch: "#1a40a6" },
];

export default function AddTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [text, setText] = useState("");
  const [x, setX] = useState(15);
  const [y, setY] = useState(15);
  const [fontSize, setFontSize] = useState(18);
  const [colorIndex, setColorIndex] = useState(0);
  const [bold, setBold] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, PREVIEW_SCALE);

  const pageWidthPt = pages[pageIndex] ? pages[pageIndex].width / PREVIEW_SCALE : null;
  const fontSizeCqw = pageWidthPt ? (fontSize / pageWidthPt) * 100 : 3;

  async function handleApply() {
    if (!file || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await placeTextOnPdf(file, text, {
        pageIndex,
        xPercent: x,
        yPercent: y,
        fontSize,
        color: COLORS[colorIndex].value,
        bold,
      });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't add the text.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setText("");
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel title="Text added" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_text.pdf`)} onReset={reset} />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : loading ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering preview…</p>
        ) : (
          <div className="paper-stack p-6">
            {pages.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-ink">Page</label>
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
              </div>
            )}

            <div
              className="relative mx-auto w-full max-w-sm overflow-visible rounded border border-paper-line"
              style={{ containerType: "inline-size" } as React.CSSProperties}
            >
              <img src={pages[pageIndex]?.dataUrl} alt="Page preview" className="block w-full rounded" />
              {text && (
                <div
                  className="absolute whitespace-pre pointer-events-none"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    fontSize: `${fontSizeCqw}cqw`,
                    lineHeight: 1.25,
                    color: COLORS[colorIndex].swatch,
                    fontWeight: bold ? 700 : 400,
                    fontFamily: "Helvetica, Arial, sans-serif",
                  }}
                >
                  {text}
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-ink">Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Type what should appear on the page…"
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-faint">X — {x}%</label>
                <input type="range" min={0} max={90} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full accent-amber-dark" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-faint">Y — {y}%</label>
                <input type="range" min={0} max={90} value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full accent-amber-dark" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-faint">Size — {fontSize}pt</label>
                <input type="range" min={8} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-amber-dark" />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex gap-1.5">
                  {COLORS.map((c, i) => (
                    <button
                      key={c.label}
                      onClick={() => setColorIndex(i)}
                      title={c.label}
                      className={`h-6 w-6 rounded-full border-2 ${colorIndex === i ? "border-amber-dark" : "border-transparent"}`}
                      style={{ backgroundColor: c.swatch }}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} className="accent-amber-dark" />
                  Bold
                </label>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!text.trim() || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Add text"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
