"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { nUpPdf, type NUpLayout } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("n-up")!;

const LAYOUTS: { value: NUpLayout; label: string; grid: string }[] = [
  { value: 2, label: "2-up", grid: "grid-cols-1 grid-rows-2" },
  { value: 4, label: "4-up", grid: "grid-cols-2 grid-rows-2" },
  { value: 6, label: "6-up", grid: "grid-cols-2 grid-rows-3" },
  { value: 9, label: "9-up", grid: "grid-cols-3 grid-rows-3" },
];

export default function NUpPage() {
  const [file, setFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<NUpLayout>(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await nUpPdf(file, layout);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't lay out this PDF.");
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
            title="Pages combined"
            detail={`${layout} pages per sheet`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_${layout}up.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />

            <p className="mt-5 text-sm font-medium text-ink">Pages per sheet</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLayout(l.value)}
                  className={`flex flex-col items-center gap-2 rounded-md border px-4 py-3 transition-colors ${
                    layout === l.value ? "border-teal bg-teal-light/40" : "border-paper-line hover:border-ink-faint/40"
                  }`}
                >
                  <span className={`grid h-10 w-8 gap-0.5 ${l.grid}`}>
                    {Array.from({ length: l.value }).map((_, i) => (
                      <span key={i} className="rounded-[1px] border border-ink-faint/50 bg-white" />
                    ))}
                  </span>
                  <span className="text-xs font-medium text-ink">{l.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              Pages are scaled down to fit and centered on each sheet, in reading order — nothing is cropped or stretched.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={busy}
                className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
              >
                {busy ? "Combining…" : "Combine pages"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
