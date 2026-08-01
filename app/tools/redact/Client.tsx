"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import RedactCanvas, { PctBox } from "@/components/RedactCanvas";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { redactPdf, RedactionBox } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("redact")!;

interface StoredBox extends PctBox {
  pageIndex: number;
}

export default function RedactPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [boxes, setBoxes] = useState<StoredBox[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 1);

  function addBox(b: PctBox) {
    setBoxes((prev) => [...prev, { ...b, pageIndex }]);
  }
  function removeBox(id: string) {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (boxes.length === 0) throw new Error("Draw at least one box over content you want to redact.");
      const payload: RedactionBox[] = boxes.map((b) => ({
        pageIndex: b.pageIndex,
        xPercent: b.xPercent,
        yPercent: b.yPercent,
        wPercent: b.wPercent,
        hPercent: b.hPercent,
      }));
      const bytes = await redactPdf(file, payload);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't redact this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setBoxes([]);
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  const currentBoxes = boxes.filter((b) => b.pageIndex === pageIndex);

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Redactions applied"
            detail={`${boxes.length} area${boxes.length === 1 ? "" : "s"} permanently blacked out`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_redacted.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to redact" hint="Draw boxes over anything you want permanently removed" onFiles={(f) => setFile(f[0])} />
        ) : loading ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering pages…</p>
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
                      Page {p.index + 1} {boxes.some((b) => b.pageIndex === p.index) ? "•" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <RedactCanvas imageSrc={pages[pageIndex]?.dataUrl} boxes={currentBoxes} onAdd={addBox} onRemove={removeBox} />
            <p className="mt-2 text-xs text-ink-faint">
              Click and drag to draw a box. Hover a box and tap the × to remove it. Pages with redactions are permanently flattened to an image.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={boxes.length === 0 || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Redacting…" : `Apply ${boxes.length || ""} redaction${boxes.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
