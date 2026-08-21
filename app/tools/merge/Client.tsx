"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { mergePdfs } from "@/lib/pdfTools";
import { downloadPdf, formatBytes } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { GripVertical, X, FileText } from "lucide-react";

const tool = getTool("merge")!;

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
  }

  function move(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleMerge() {
    setBusy(true);
    setError(null);
    try {
      const bytes = await mergePdfs(files);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong merging these files.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-3xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Your merged PDF is ready"
            detail={`${files.length} files combined · ${formatBytes(result.byteLength)}`}
            onDownload={() => downloadPdf(result, "merged.pdf")}
            onReset={reset}
          />
        ) : (
          <>
            {files.length === 0 ? (
              <Dropzone
                accept="application/pdf"
                multiple
                label="Add PDFs to merge"
                hint="Choose two or more files — you can reorder them next"
                onFiles={addFiles}
              />
            ) : (
              <div className="paper-stack p-5">
                <ul className="divide-y divide-paper-line">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                      <GripVertical size={16} className="text-ink-faint shrink-0" />
                      <FileText size={16} className="text-teal-dark shrink-0" />
                      <span className="flex-1 truncate text-sm font-mono">{f.name}</span>
                      <span className="text-xs text-ink-faint shrink-0">{formatBytes(f.size)}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-ink-faint hover:text-ink disabled:opacity-30">↑</button>
                        <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="p-1 text-ink-faint hover:text-ink disabled:opacity-30">↓</button>
                        <button onClick={() => remove(i)} className="p-1 text-rust hover:text-rust-dark"><X size={15} /></button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between">
                  <label className="text-sm text-amber-dark font-medium cursor-pointer">
                    + Add more files
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                    />
                  </label>
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2 || busy}
                    className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40 transition-colors"
                  >
                    {busy ? "Merging…" : `Merge ${files.length} files`}
                  </button>
                </div>
                {files.length < 2 && (
                  <p className="mt-2 text-xs text-ink-faint">Add at least one more file to merge.</p>
                )}
              </div>
            )}
            {error && <p className="mt-4 text-sm text-rust-dark">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
