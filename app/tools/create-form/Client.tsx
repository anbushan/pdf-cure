"use client";

import { useState, useRef } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { createFillableForm, type NewFieldSpec } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { Type, Square, X } from "lucide-react";

const tool = getTool("create-form")!;
const PREVIEW_SCALE = 0.7;

// Default field sizes in PDF points — a typical single-line text box and
// a standard checkbox square, independent of page size.
const TEXT_FIELD_W = 160;
const TEXT_FIELD_H = 22;
const CHECKBOX_SIZE = 16;

interface PlacedField extends NewFieldSpec {
  id: number;
}

export default function CreateFormPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<"text" | "checkbox">("text");
  const [fields, setFields] = useState<PlacedField[]>([]);
  const [nextId, setNextId] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, PREVIEW_SCALE);
  const imgRef = useRef<HTMLImageElement>(null);

  const page = pages[pageIndex];
  const pageWidthPt = page ? page.width / PREVIEW_SCALE : null;
  const pageHeightPt = page ? page.height / PREVIEW_SCALE : null;

  function handlePlace(e: React.MouseEvent<HTMLDivElement>) {
    if (!page || !pageWidthPt || !pageHeightPt || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const clickXPt = ((e.clientX - rect.left) / rect.width) * pageWidthPt;
    const clickYFromTopPt = ((e.clientY - rect.top) / rect.height) * pageHeightPt;

    const w = mode === "text" ? TEXT_FIELD_W : CHECKBOX_SIZE;
    const h = mode === "text" ? TEXT_FIELD_H : CHECKBOX_SIZE;
    // Click point becomes the box's top-left in screen terms; convert to
    // PDF's bottom-left-origin, y-up rect.
    const x = Math.max(0, Math.min(pageWidthPt - w, clickXPt - w / 2));
    const y = Math.max(0, pageHeightPt - clickYFromTopPt - h / 2);

    const count = fields.filter((f) => f.kind === mode).length + 1;
    setFields((prev) => [
      ...prev,
      {
        id: nextId,
        fieldName: mode === "text" ? `text_field_${count}` : `checkbox_${count}`,
        kind: mode,
        pageIndex,
        rect: { x, y, width: w, height: h },
      },
    ]);
    setNextId((n) => n + 1);
  }

  function removeField(id: number) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function renameField(id: number, name: string) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, fieldName: name } : f)));
  }

  async function handleApply() {
    if (!file) return;
    if (fields.length === 0) {
      setError("Place at least one field on the page first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await createFillableForm(file, fields);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't create the form fields.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setFields([]);
    setNextId(1);
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  const fieldsOnPage = fields.filter((f) => f.pageIndex === pageIndex);

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Form fields added"
            detail={`${fields.length} field${fields.length === 1 ? "" : "s"} added`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_form.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to build a form on" onFiles={(f) => setFile(f[0])} />
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
                    <option key={p.index} value={p.index}>Page {p.index + 1}{fields.some((f) => f.pageIndex === p.index) ? ` (${fields.filter((f) => f.pageIndex === p.index).length} field${fields.filter((f) => f.pageIndex === p.index).length === 1 ? "" : "s"})` : ""}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setMode("text")}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "text" ? "border-amber bg-amber-light/40 text-ink" : "border-paper-line text-ink-faint hover:text-ink"
                }`}
              >
                <Type size={15} /> Text field
              </button>
              <button
                onClick={() => setMode("checkbox")}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "checkbox" ? "border-amber bg-amber-light/40 text-ink" : "border-paper-line text-ink-faint hover:text-ink"
                }`}
              >
                <Square size={15} /> Checkbox
              </button>
            </div>
            <p className="mb-3 text-xs text-ink-faint">Click anywhere on the page below to place a {mode === "text" ? "text field" : "checkbox"} there.</p>

            <div
              onClick={handlePlace}
              className="relative mx-auto w-full max-w-sm cursor-crosshair overflow-hidden rounded border border-paper-line"
            >
              <img ref={imgRef} src={page?.dataUrl} alt="Page preview" className="block w-full select-none rounded" draggable={false} />
              {pageWidthPt && pageHeightPt && fieldsOnPage.map((f) => {
                const left = (f.rect.x / pageWidthPt) * 100;
                const top = ((pageHeightPt - f.rect.y - f.rect.height) / pageHeightPt) * 100;
                const width = (f.rect.width / pageWidthPt) * 100;
                const height = (f.rect.height / pageHeightPt) * 100;
                return (
                  <div
                    key={f.id}
                    className="absolute flex items-center justify-center border-2 border-amber-dark bg-amber-light/50 pointer-events-none"
                    style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
                  >
                    {f.kind === "text" && <span className="truncate px-1 text-[9px] text-ink-faint">{f.fieldName}</span>}
                  </div>
                );
              })}
            </div>

            {fields.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-sm font-medium text-ink">Fields ({fields.length})</p>
                {fields.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 rounded-md border border-paper-line px-2.5 py-1.5">
                    {f.kind === "text" ? <Type size={13} className="shrink-0 text-ink-faint" /> : <Square size={13} className="shrink-0 text-ink-faint" />}
                    <input
                      value={f.fieldName}
                      onChange={(e) => renameField(f.id, e.target.value)}
                      className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 text-sm font-mono hover:border-paper-line focus:border-amber focus:outline-none"
                    />
                    <span className="shrink-0 text-xs text-ink-faint">p.{f.pageIndex + 1}</span>
                    <button onClick={() => removeField(f.id)} className="shrink-0 p-0.5 text-ink-faint hover:text-rust-dark">
                      <X size={13} />
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
                disabled={busy || fields.length === 0}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Creating…" : "Create form"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
