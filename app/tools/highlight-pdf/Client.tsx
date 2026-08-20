"use client";

import { useRef, useState } from "react";
import { Trash2, Highlighter, MessageSquarePlus } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import RedactCanvas, { PctBox } from "@/components/RedactCanvas";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { annotatePdf, HighlightBox, CommentMark } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("highlight-pdf")!;

const COLORS: { label: string; hex: string; rgb: [number, number, number] }[] = [
  { label: "Yellow", hex: "#f5d633", rgb: [0.96, 0.84, 0.2] },
  { label: "Green", hex: "#8cd973", rgb: [0.55, 0.85, 0.45] },
  { label: "Pink", hex: "#f28cc0", rgb: [0.95, 0.55, 0.75] },
  { label: "Blue", hex: "#8cbff2", rgb: [0.55, 0.75, 0.95] },
];

interface StoredHighlight extends PctBox {
  pageIndex: number;
}

interface StoredComment {
  id: string;
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  text: string;
  colorIndex: number;
}

export default function HighlightPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<"highlight" | "comment">("highlight");
  const [colorIndex, setColorIndex] = useState(0);
  const [highlights, setHighlights] = useState<StoredHighlight[]>([]);
  const [comments, setComments] = useState<StoredComment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 1);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  function addHighlight(b: PctBox) {
    setHighlights((prev) => [...prev, { ...b, pageIndex }]);
  }
  function removeHighlight(id: string) {
    setHighlights((prev) => prev.filter((b) => b.id !== id));
  }

  function addCommentAt(e: React.MouseEvent<HTMLDivElement>) {
    const rect = imgWrapRef.current!.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setComments((prev) => [...prev, { id: crypto.randomUUID(), pageIndex, xPercent, yPercent, text: "", colorIndex }]);
  }
  function updateComment(id: string, text: string) {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  }
  function removeComment(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (highlights.length === 0 && comments.length === 0) {
        throw new Error("Draw a highlight or add a comment first.");
      }
      const highlightPayload: HighlightBox[] = highlights.map((h) => ({
        pageIndex: h.pageIndex,
        xPercent: h.xPercent,
        yPercent: h.yPercent,
        wPercent: h.wPercent,
        hPercent: h.hPercent,
        color: COLORS.find((c) => c.hex === h.color)?.rgb ?? COLORS[0].rgb,
      }));
      const commentPayload: CommentMark[] = comments
        .filter((c) => c.text.trim().length > 0)
        .map((c) => ({ pageIndex: c.pageIndex, xPercent: c.xPercent, yPercent: c.yPercent, text: c.text, color: COLORS[c.colorIndex].rgb }));
      const bytes = await annotatePdf(file, highlightPayload, commentPayload);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't annotate this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setHighlights([]);
    setComments([]);
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  const currentHighlights = highlights.filter((b) => b.pageIndex === pageIndex);
  const currentComments = comments.filter((c) => c.pageIndex === pageIndex);
  const totalMarks = highlights.length + comments.length;

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Annotations added"
            detail={`${highlights.length} highlight${highlights.length === 1 ? "" : "s"}, ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_annotated.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to mark up" onFiles={(f) => setFile(f[0])} />
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
                      Page {p.index + 1} {highlights.some((b) => b.pageIndex === p.index) || comments.some((c) => c.pageIndex === p.index) ? "•" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-md border border-paper-line p-0.5">
                <button
                  onClick={() => setMode("highlight")}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium ${mode === "highlight" ? "bg-amber text-ink" : "text-ink-faint hover:text-ink"}`}
                >
                  <Highlighter size={13} /> Highlight
                </button>
                <button
                  onClick={() => setMode("comment")}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium ${mode === "comment" ? "bg-amber text-ink" : "text-ink-faint hover:text-ink"}`}
                >
                  <MessageSquarePlus size={13} /> Comment
                </button>
              </div>
              <div className="flex gap-1.5">
                {COLORS.map((c, i) => (
                  <button
                    key={c.label}
                    onClick={() => setColorIndex(i)}
                    title={c.label}
                    className={`h-6 w-6 rounded-full border-2 ${colorIndex === i ? "border-ink" : "border-transparent"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {mode === "highlight" ? (
              <RedactCanvas imageSrc={pages[pageIndex]?.dataUrl} boxes={currentHighlights} onAdd={addHighlight} onRemove={removeHighlight} boxColor={`${COLORS[colorIndex].hex}66`} />
            ) : (
              <div ref={imgWrapRef} onClick={addCommentAt} className="relative w-full cursor-crosshair select-none overflow-hidden rounded border border-paper-line">
                <img src={pages[pageIndex]?.dataUrl} alt="Page preview" className="block w-full pointer-events-none" draggable={false} />
                {currentComments.map((c, i) => (
                  <div
                    key={c.id}
                    className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold text-white shadow"
                    style={{ left: `${c.xPercent}%`, top: `${c.yPercent}%`, backgroundColor: COLORS[c.colorIndex].hex }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-ink-faint">
              {mode === "highlight"
                ? "Click and drag to draw a highlight. Hover a box and tap the × to remove it."
                : "Click anywhere on the page to drop a numbered comment, then write its text below."}
            </p>

            {currentComments.length > 0 && (
              <div className="mt-4 space-y-2">
                {currentComments.map((c, i) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: COLORS[c.colorIndex].hex }}
                    >
                      {i + 1}
                    </span>
                    <textarea
                      value={c.text}
                      onChange={(e) => updateComment(c.id, e.target.value)}
                      placeholder="Comment text…"
                      rows={1}
                      className="flex-1 rounded-md border border-paper-line bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                    <button onClick={() => removeComment(c.id)} className="mt-1.5 shrink-0 text-ink-faint hover:text-rust-dark">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={totalMarks === 0 || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Apply & download"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
