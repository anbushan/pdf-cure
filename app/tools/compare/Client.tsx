"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import SharedFilePreview from "@/components/FilePreview";
import { comparePdfs, CompareResult } from "@/lib/comparePdfs";
import { RotateCcw } from "lucide-react";
import { useErrorToast } from "@/components/useErrorToast";
import { useToast } from "@/components/ToastProvider";
import { trackEvent } from "@/lib/analytics";

const tool = getTool("compare")!;

type View = "diff" | "side-by-side";

export default function CompareClient() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const toast = useToast();
  const [result, setResult] = useState<CompareResult | null>(null);
  const [view, setView] = useState<View>("diff");

  async function handleCompare(a: File, b: File) {
    setBusy(true);
    setError(null);
    try {
      const res = await comparePdfs(a, b, (done, total) => setProgress({ done, total }));
      setResult(res);
      toast.success("Comparison ready.");
      trackEvent("tool_success", { page: "/tools/compare" });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't compare these PDFs.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFileA(null);
    setFileB(null);
    setResult(null);
    setError(null);
  }

  const changedCount = result?.comparisons.filter((c) => c.status !== "same").length ?? 0;

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-4xl px-6 mt-8">
        {result ? (
          <div>
            <div className="paper-stack p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-base font-semibold">
                  {changedCount === 0 ? "No differences found" : `${changedCount} of ${result.pageCount} pages differ`}
                </p>
                <p className="text-xs text-ink-faint mt-0.5 font-mono">
                  {fileA?.name} ({result.pagesA}p) vs {fileB?.name} ({result.pagesB}p)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border border-paper-line overflow-hidden">
                  <button
                    onClick={() => setView("diff")}
                    className={`px-3 py-1.5 text-xs font-medium ${view === "diff" ? "bg-teal text-white" : "text-ink-faint hover:text-ink"}`}
                  >
                    Diff overlay
                  </button>
                  <button
                    onClick={() => setView("side-by-side")}
                    className={`px-3 py-1.5 text-xs font-medium ${view === "side-by-side" ? "bg-teal text-white" : "text-ink-faint hover:text-ink"}`}
                  >
                    Side by side
                  </button>
                </div>
                <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-xs font-medium text-ink-faint hover:text-ink">
                  <RotateCcw size={12} /> New comparison
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {result.comparisons.map((c) => (
                <div key={c.pageIndex} className="paper-stack p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-ink-faint">Page {c.pageIndex + 1}</span>
                    {c.status === "same" && <span className="rounded-full bg-teal-light px-2.5 py-1 text-[11px] font-medium text-teal-dark">Unchanged</span>}
                    {c.status === "different" && (
                      <span className="rounded-full bg-rust-light px-2.5 py-1 text-[11px] font-medium text-rust-dark">{c.diffPercent.toFixed(1)}% different</span>
                    )}
                    {c.status === "only-a" && <span className="rounded-full bg-amber-light px-2.5 py-1 text-[11px] font-medium text-amber-dark">Only in Document A</span>}
                    {c.status === "only-b" && <span className="rounded-full bg-amber-light px-2.5 py-1 text-[11px] font-medium text-amber-dark">Only in Document B</span>}
                  </div>

                  {view === "diff" && c.diffImage ? (
                    <img src={c.diffImage} alt={`Diff for page ${c.pageIndex + 1}`} className="w-full rounded border border-paper-line" />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 text-[10px] font-mono text-ink-faint uppercase">Document A</p>
                        {c.imageA ? (
                          <img src={c.imageA} alt="" className="w-full rounded border border-paper-line" />
                        ) : (
                          <div className="flex aspect-[3/4] items-center justify-center rounded border border-dashed border-paper-line text-xs text-ink-faint">No page</div>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-mono text-ink-faint uppercase">Document B</p>
                        {c.imageB ? (
                          <img src={c.imageB} alt="" className="w-full rounded border border-paper-line" />
                        ) : (
                          <div className="flex aspect-[3/4] items-center justify-center rounded border border-dashed border-paper-line text-xs text-ink-faint">No page</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : busy ? (
          <div className="paper-stack p-10 text-center">
            <p className="text-sm text-ink-faint">Comparing page {progress.done} of {progress.total}…</p>
            <div className="mt-3 mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-paper-line">
              <div className="h-full bg-teal transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Document A</p>
                {fileA ? (
                  <FilePreview file={fileA} onClear={() => setFileA(null)} />
                ) : (
                  <Dropzone accept="application/pdf" label="Select the original" onFiles={(f) => setFileA(f[0])} />
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Document B</p>
                {fileB ? (
                  <FilePreview file={fileB} onClear={() => setFileB(null)} />
                ) : (
                  <Dropzone accept="application/pdf" label="Select the revised version" onFiles={(f) => setFileB(f[0])} />
                )}
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => fileA && fileB && handleCompare(fileA, fileB)}
                disabled={!fileA || !fileB}
                className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
              >
                Compare documents
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilePreview({ file, onClear }: { file: File; onClear: () => void }) {
  return (
    <div className="paper-stack flex items-center gap-3 p-4">
      <SharedFilePreview file={file} className="flex-1 border-0 bg-transparent p-0" />
      <button onClick={onClear} className="text-xs font-medium text-rust-dark shrink-0">
        Change
      </button>
    </div>
  );
}
