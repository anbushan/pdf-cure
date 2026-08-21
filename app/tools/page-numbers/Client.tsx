"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { addPageNumbers, PageNumberPosition } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("page-numbers")!;

const POSITIONS: { id: PageNumberPosition; label: string }[] = [
  { id: "top-left", label: "Top left" },
  { id: "top-center", label: "Top center" },
  { id: "top-right", label: "Top right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-right", label: "Bottom right" },
];

// Mirrors the margin/percent math addPageNumbers uses in points, just
// expressed as CSS anchoring so the overlay lands in the same spot.
const POSITION_STYLE: Record<PageNumberPosition, React.CSSProperties> = {
  "top-left": { top: "3%", left: "5%" },
  "top-center": { top: "3%", left: "50%", transform: "translateX(-50%)" },
  "top-right": { top: "3%", right: "5%" },
  "bottom-left": { bottom: "3%", left: "5%" },
  "bottom-center": { bottom: "3%", left: "50%", transform: "translateX(-50%)" },
  "bottom-right": { bottom: "3%", right: "5%" },
};

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [startAt, setStartAt] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 0.6);

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await addPageNumbers(file, position, startAt);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't add page numbers.");
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
            title="Page numbers added"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_numbered.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : loading ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering preview…</p>
        ) : (
          <div className="paper-stack p-6 space-y-5">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded border border-paper-line">
              <img src={pages[0]?.dataUrl} alt="Page preview" className="block w-full rounded" />
              <div
                className="absolute rounded bg-amber-light/70 px-1.5 py-0.5 text-xs font-semibold text-ink pointer-events-none"
                style={POSITION_STYLE[position]}
              >
                {startAt}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink mb-2">Position</p>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPosition(p.id)}
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                      position === p.id ? "border-amber bg-amber-light/40 text-ink" : "border-paper-line text-ink-faint hover:border-ink-faint/40"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Start numbering at</label>
              <input
                type="number"
                min={0}
                value={startAt}
                onChange={(e) => setStartAt(Number(e.target.value))}
                className="mt-1.5 w-28 rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
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
                {busy ? "Applying…" : "Add page numbers"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
