"use client";

import { useState } from "react";
import Link from "next/link";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { readPdfFormFields, fillPdfForm, FormInfo } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("fill-form")!;

export default function FillFormPage() {
  const [file, setFile] = useState<File | null>(null);
  const [formInfo, setFormInfo] = useState<FormInfo | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [flatten, setFlatten] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 0.7);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setLoadingFields(true);
    setError(null);
    try {
      const info = await readPdfFormFields(f);
      if (info.widgets.length === 0) {
        throw new Error(
          "This PDF doesn't have any fillable form fields. If it's a scanned or flat form, use Add Text to PDF to type onto it instead."
        );
      }
      setFile(f);
      setFormInfo(info);
      setValues(info.values);
      setPageIndex(info.widgets[0].pageIndex);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read this PDF's form fields.");
    } finally {
      setLoadingFields(false);
    }
  }

  function setValue(name: string, value: string | boolean) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await fillPdfForm(file, values, { flatten });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't fill this form.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setFormInfo(null);
    setValues({});
    setResult(null);
    setError(null);
    setPageIndex(0);
    setFlatten(false);
  }

  const pageSize = formInfo?.pageSizes[pageIndex];
  const widgetsOnPage = formInfo?.widgets.filter((w) => w.pageIndex === pageIndex) ?? [];
  const pagesWithFields = formInfo ? Array.from(new Set(formInfo.widgets.map((w) => w.pageIndex))).sort((a, b) => a - b) : [];

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result} title="Form filled" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_filled.pdf`)} onReset={reset} />
        ) : !file ? (
          <>
            <Dropzone accept="application/pdf" label="Select a PDF form" onFiles={handleFile} />
            {loadingFields && <p className="mt-3 text-sm text-ink-faint text-center">Reading form fields…</p>}
            {error && !loadingFields && (
              <p className="mt-3 text-sm text-rust-dark text-center">
                {error}{" "}
                <Link href="/tools/add-text" className="underline">
                  Try Add Text to PDF →
                </Link>
              </p>
            )}
          </>
        ) : loading || !formInfo ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering preview…</p>
        ) : (
          <div className="paper-stack p-6">
            {pagesWithFields.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-ink">Page</label>
                <select
                  value={pageIndex}
                  onChange={(e) => setPageIndex(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                >
                  {pagesWithFields.map((p) => (
                    <option key={p} value={p}>
                      Page {p + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative mx-auto w-full max-w-md overflow-visible rounded border border-paper-line">
              <img src={pages[pageIndex]?.dataUrl} alt="Page preview" className="block w-full rounded" />
              {pageSize &&
                widgetsOnPage.map((w, i) => {
                  const left = (w.rect.x / pageSize.width) * 100;
                  const top = ((pageSize.height - w.rect.y - w.rect.height) / pageSize.height) * 100;
                  const width = (w.rect.width / pageSize.width) * 100;
                  const height = (w.rect.height / pageSize.height) * 100;
                  const style = { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };

                  if (w.kind === "checkbox") {
                    return (
                      <input
                        key={i}
                        type="checkbox"
                        className="absolute accent-amber-dark"
                        style={style}
                        checked={!!values[w.fieldName]}
                        onChange={(e) => setValue(w.fieldName, e.target.checked)}
                      />
                    );
                  }
                  if (w.kind === "radio") {
                    return (
                      <input
                        key={i}
                        type="radio"
                        name={w.fieldName}
                        className="absolute accent-amber-dark"
                        style={style}
                        checked={values[w.fieldName] === w.radioValue}
                        onChange={() => setValue(w.fieldName, w.radioValue ?? "")}
                      />
                    );
                  }
                  if (w.kind === "dropdown" || w.kind === "optionList") {
                    return (
                      <select
                        key={i}
                        className="absolute rounded-sm border border-amber-dark bg-white/95 text-[10px] leading-none"
                        style={style}
                        value={(values[w.fieldName] as string) ?? ""}
                        onChange={(e) => setValue(w.fieldName, e.target.value)}
                      >
                        <option value="" />
                        {(w.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  return w.multiline ? (
                    <textarea
                      key={i}
                      className="absolute resize-none rounded-sm border border-amber-dark bg-white/95 px-1 text-[10px] leading-tight focus:outline-none focus:ring-1 focus:ring-amber-dark"
                      style={style}
                      value={(values[w.fieldName] as string) ?? ""}
                      onChange={(e) => setValue(w.fieldName, e.target.value)}
                    />
                  ) : (
                    <input
                      key={i}
                      type="text"
                      className="absolute rounded-sm border border-amber-dark bg-white/95 px-1 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-amber-dark"
                      style={style}
                      value={(values[w.fieldName] as string) ?? ""}
                      onChange={(e) => setValue(w.fieldName, e.target.value)}
                    />
                  );
                })}
            </div>

            <p className="mt-4 text-xs text-ink-faint">
              Fields are highlighted in amber — click any of them to type or choose a value. Switch pages above to fill fields elsewhere in the document.
            </p>

            <label className="mt-4 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} className="accent-amber-dark" />
              Lock the form after filling (flatten — values can no longer be edited)
            </label>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Filling…" : "Fill & download"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
