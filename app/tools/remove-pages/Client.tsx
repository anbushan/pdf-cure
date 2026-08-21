"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import PageSelectGrid from "@/components/PageSelectGrid";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { removePages } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("remove-pages")!;

export default function RemovePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file);

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  async function handleRemove() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (selected.size >= pages.length) throw new Error("You can't remove every page.");
      const bytes = await removePages(file, Array.from(selected));
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't remove those pages.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setSelected(new Set());
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-3xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Pages removed"
            detail={`${selected.size} page${selected.size === 1 ? "" : "s"} deleted`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_edited.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" hint="Tap the pages you want to delete" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div>
            <p className="text-sm text-ink-faint mb-4">
              Select the pages to remove. <span className="font-medium text-ink">{selected.size} selected.</span>
            </p>
            <PageSelectGrid pages={pages} selected={selected} onToggle={toggle} loading={loading} />
            {error && <p className="mt-4 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={selected.size === 0 || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Removing…" : `Remove ${selected.size || ""} page${selected.size === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
