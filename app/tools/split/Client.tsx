"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { getPdfPageCount } from "@/lib/pdfRender";
import { parseRanges, splitByRanges, splitEveryNPages } from "@/lib/pdfTools";
import { stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("split")!;

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"ranges" | "every">("ranges");
  const [ranges, setRanges] = useState("");
  const [everyN, setEveryN] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<{ blob: Blob; count: number } | null>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    const count = await getPdfPageCount(f);
    setPageCount(count);
    setRanges(count > 1 ? `1-${Math.ceil(count / 2)},${Math.ceil(count / 2) + 1}-${count}` : "1");
    setEveryN(Math.min(10, count) || 1);
  }

  async function handleSplit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const groups =
        mode === "ranges"
          ? parseRanges(ranges, pageCount)
          : splitEveryNPages(pageCount, everyN);
      if (groups.length === 0) throw new Error("Enter at least one valid page range, e.g. 1-3,5,7-9");
      const parts = await splitByRanges(file, groups);
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      parts.forEach((bytes, i) => {
        zip.file(`${stripExt(file.name)}_part${i + 1}.pdf`, bytes);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      setResult({ blob, count: parts.length });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't split this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setRanges("");
    setMode("ranges");
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-3xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Your PDF has been split"
            detail={`${result.count} files, zipped together`}
            downloadLabel="Download .zip"
            onDownload={() => saveAs(result.blob, `${stripExt(file?.name ?? "split")}.zip`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to split" onFiles={handleFile} />
        ) : (
          <div className="paper-stack p-6">
            <FilePreview file={file} className="mb-5" />

            <div className="mt-5 flex gap-2">
              {(["ranges", "every"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === m ? "border-amber bg-amber-light/40" : "border-paper-line text-ink-faint hover:border-ink-faint/40"
                  }`}
                >
                  {m === "ranges" ? "Custom ranges" : "Every N pages"}
                </button>
              ))}
            </div>

            {mode === "ranges" ? (
              <>
                <label className="mt-4 block text-sm font-medium text-ink">Page ranges</label>
                <input
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="e.g. 1-3,5,7-9"
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <p className="mt-1.5 text-xs text-ink-faint">
                  Each comma-separated group becomes its own PDF. This document has {pageCount} page{pageCount === 1 ? "" : "s"}.
                </p>
              </>
            ) : (
              <>
                <label className="mt-4 block text-sm font-medium text-ink">Pages per file</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, pageCount)}
                  value={everyN}
                  onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="mt-1.5 w-32 rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <p className="mt-1.5 text-xs text-ink-faint">
                  Splits this {pageCount}-page document into {Math.ceil(pageCount / Math.max(1, everyN)) || 0} equal parts of{" "}
                  {everyN} page{everyN === 1 ? "" : "s"} each (the last part may be shorter).
                </p>
              </>
            )}

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleSplit}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Splitting…" : "Split PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
