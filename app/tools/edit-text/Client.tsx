"use client";

import { useEffect, useMemo, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { getEditableTextItems, applyTextEdits, type EditableTextItem } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("edit-text")!;
const PREVIEW_SCALE = 0.9;

export default function EditTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [items, setItems] = useState<EditableTextItem[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [edits, setEdits] = useState<Map<number, string>>(new Map());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, PREVIEW_SCALE);

  async function handleFile(f: File) {
    setFile(f);
    setLoadingItems(true);
    setError(null);
    try {
      const found = await getEditableTextItems(f);
      if (found.length === 0) {
        throw new Error("Couldn't find any selectable text on this PDF — a scanned page needs OCR PDF first.");
      }
      setItems(found);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read this PDF's text.");
      setFile(null);
    } finally {
      setLoadingItems(false);
    }
  }

  function setEdit(id: number, value: string) {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(id, value);
      return next;
    });
  }

  const editedCount = useMemo(() => {
    if (!items) return 0;
    let count = 0;
    for (const it of items) {
      const v = edits.get(it.id);
      if (v !== undefined && v !== it.text) count++;
    }
    return count;
  }, [items, edits]);

  async function handleApply() {
    if (!file || !items) return;
    if (editedCount === 0) {
      setError("Change some text first — click any word on the page and type.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await applyTextEdits(file, items, edits);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't apply these edits.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setItems(null);
    setEdits(new Map());
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  const page = pages[pageIndex];
  const pageWidthPt = page ? page.width / PREVIEW_SCALE : null;
  const pageHeightPt = page ? page.height / PREVIEW_SCALE : null;
  const itemsOnPage = items?.filter((it) => it.pageIndex === pageIndex) ?? [];
  const pagesWithText = items ? Array.from(new Set(items.map((it) => it.pageIndex))).sort((a, b) => a - b) : [];

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Text updated"
            detail={`${editedCount} change${editedCount === 1 ? "" : "s"} applied`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_edited.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <>
            <Dropzone accept="application/pdf" label="Select a PDF to edit" onFiles={(f) => handleFile(f[0])} />
            {loadingItems && <p className="mt-3 text-sm text-ink-faint text-center">Reading text…</p>}
            {error && !loadingItems && <p className="mt-3 text-sm text-rust-dark text-center">{error}</p>}
          </>
        ) : loading || !items ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering preview…</p>
        ) : (
          <div className="paper-stack p-6">
            {pagesWithText.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-ink">Page</label>
                <select
                  value={pageIndex}
                  onChange={(e) => setPageIndex(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                >
                  {pagesWithText.map((p) => (
                    <option key={p} value={p}>Page {p + 1}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="mb-3 text-xs text-ink-faint">
              Click any word below and type to change it — new text is drawn over the old with a white patch behind
              it, so this works best on plain white pages. Colored or textured backgrounds may show a faint edge.
            </p>

            <div
              className="relative mx-auto w-full max-w-md overflow-hidden rounded border border-paper-line"
              style={{ containerType: "inline-size" } as React.CSSProperties}
            >
              <img src={page?.dataUrl} alt="Page preview" className="block w-full select-none rounded" draggable={false} />
              {pageWidthPt && pageHeightPt && itemsOnPage.map((it) => {
                const left = (it.x / pageWidthPt) * 100;
                const top = ((pageHeightPt - it.y - it.height) / pageHeightPt) * 100;
                const width = Math.max((it.width / pageWidthPt) * 100, 2);
                const fontSizeCqw = (it.fontSize / pageWidthPt) * 100;
                const value = edits.get(it.id) ?? it.text;
                const changed = value !== it.text;
                return (
                  <input
                    key={it.id}
                    value={value}
                    onChange={(e) => setEdit(it.id, e.target.value)}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      fontSize: `${fontSizeCqw}cqw`,
                      lineHeight: 1.1,
                    }}
                    // Unedited items stay fully transparent (text and
                    // background) so only the page image's own rendered
                    // glyphs show through underneath — otherwise every
                    // untouched word would visually double up with the
                    // input's own copy of the same text sitting on top
                    // of it. Only once something is actually typed (or
                    // while a field has focus, so you can see what
                    // you're typing) does it get an opaque background
                    // and ink color, which also previews the white
                    // patch-and-redraw the export itself will do.
                    className={`absolute rounded-sm border px-0 font-sans caret-ink focus:outline-none focus:text-ink focus:bg-white focus:ring-1 focus:ring-amber ${
                      changed ? "border-amber-dark bg-amber-light/70 text-ink" : "border-transparent bg-transparent text-transparent hover:border-paper-line/70"
                    }`}
                  />
                );
              })}
            </div>

            <p className="mt-3 text-xs text-ink-faint">{editedCount} change{editedCount === 1 ? "" : "s"} so far.</p>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={busy || editedCount === 0}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
