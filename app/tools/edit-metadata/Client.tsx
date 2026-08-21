"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { readPdfMetadata, writePdfMetadata, PdfMetadata } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("edit-metadata")!;
const EMPTY: PdfMetadata = { title: "", author: "", subject: "", keywords: "" };

export default function EditMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMetadata>(EMPTY);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setLoadingMeta(true);
    setError(null);
    try {
      const m = await readPdfMetadata(f);
      setFile(f);
      setMeta(m);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read this PDF.");
    } finally {
      setLoadingMeta(false);
    }
  }

  function set<K extends keyof PdfMetadata>(key: K, value: PdfMetadata[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await writePdfMetadata(file, meta);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't update this PDF's metadata.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setMeta(EMPTY);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result} title="Metadata updated" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_updated.pdf`)} onReset={reset} />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={handleFile} />
        ) : loadingMeta ? (
          <p className="text-sm text-ink-faint py-10 text-center">Reading metadata…</p>
        ) : (
          <div className="paper-stack p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Title</label>
              <input
                value={meta.title}
                onChange={(e) => set("title", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Author</label>
              <input
                value={meta.author}
                onChange={(e) => set("author", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Subject</label>
              <input
                value={meta.subject}
                onChange={(e) => set("subject", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Keywords</label>
              <input
                value={meta.keywords}
                onChange={(e) => set("keywords", e.target.value)}
                placeholder="comma, separated, keywords"
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
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
                {busy ? "Saving…" : "Save metadata"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
