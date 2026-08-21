"use client";

import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { GripVertical, X, FileText } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { addBatesNumbers, type PageNumberPosition } from "@/lib/pdfTools";
import { renderPdfPages, getPdfPageCount } from "@/lib/pdfRender";
import { stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("bates-numbering")!;

const POSITIONS: { id: PageNumberPosition; label: string }[] = [
  { id: "bottom-right", label: "Bottom right" },
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "top-right", label: "Top right" },
  { id: "top-center", label: "Top center" },
  { id: "top-left", label: "Top left" },
];

/** A small first-page thumbnail for one file in the list. */
function FileThumb({ file }: { file: File }) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    renderPdfPages(file, 0.2, [0])
      .then((pages) => { if (!cancelled && pages[0]) setThumb(pages[0].dataUrl); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [file]);
  if (!thumb) {
    return (
      <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded border border-paper-line bg-paper-light">
        <FileText size={16} className="text-teal-dark" />
      </div>
    );
  }
  return <img src={thumb} alt="" className="h-10 w-8 shrink-0 rounded border border-paper-line object-cover bg-white" />;
}

export default function BatesNumberingPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("ABC");
  const [digits, setDigits] = useState(6);
  const [startAt, setStartAt] = useState(1);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-right");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [done, setDone] = useState(false);

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
    setDone(false);
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
    setDone(false);
  }

  // How many pages the whole batch covers, and the last label that will
  // be stamped — shown so people can sanity-check the range before running it.
  const [pageCounts, setPageCounts] = useState<number[]>([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(files.map((f) => getPdfPageCount(f).catch(() => 0))).then((counts) => {
      if (!cancelled) setPageCounts(counts);
    });
    return () => { cancelled = true; };
  }, [files]);
  const totalPages = pageCounts.reduce((a, b) => a + b, 0);
  const lastLabel = totalPages > 0 ? `${prefix}${String(startAt + totalPages - 1).padStart(digits, "0")}` : null;
  const firstLabel = `${prefix}${String(startAt).padStart(digits, "0")}`;

  async function run() {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const results = await addBatesNumbers(files, { prefix, digits, startAt, position });
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      results.forEach((r) => zip.file(`${stripExt(r.name)}_bates.pdf`, r.bytes));
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "bates_numbered.zip");
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't number these files.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFiles([]);
    setError(null);
    setDone(false);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        <div className="paper-stack p-6">
          {files.length === 0 ? (
            <Dropzone accept="application/pdf" multiple label="Add PDFs to number" hint="Add files in the order they should be numbered" onFiles={addFiles} />
          ) : (
            <>
              <ul className="divide-y divide-paper-line border-t border-b border-paper-line">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5">
                    <GripVertical size={16} className="shrink-0 text-ink-faint" />
                    <FileThumb file={f} />
                    <span className="flex-1 truncate text-sm font-mono">{f.name}</span>
                    <span className="shrink-0 text-xs text-ink-faint">{pageCounts[i] ? `${pageCounts[i]} pages` : ""}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-ink-faint hover:text-ink disabled:opacity-30">↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="p-1 text-ink-faint hover:text-ink disabled:opacity-30">↓</button>
                      <button onClick={() => remove(i)} className="p-1 text-rust hover:text-rust-dark"><X size={14} /></button>
                    </div>
                  </li>
                ))}
              </ul>
              <label className="mt-3 inline-block cursor-pointer text-sm font-medium text-teal-dark">
                + Add more files
                <input type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
              </label>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-ink">Prefix</label>
                  <input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="ABC-"
                    className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Digits</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={digits}
                    onChange={(e) => setDigits(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                    className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Start at</label>
                  <input
                    type="number"
                    min={0}
                    value={startAt}
                    onChange={(e) => setStartAt(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
                    className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {totalPages > 0 && (
                <p className="mt-3 text-xs text-ink-faint">
                  {totalPages} page{totalPages === 1 ? "" : "s"} across {files.length} file{files.length === 1 ? "" : "s"} — numbered <span className="font-mono">{firstLabel}</span> through <span className="font-mono">{lastLabel}</span>.
                </p>
              )}

              {done && <p className="mt-3 text-sm text-teal-dark">Done — your zip has downloaded.</p>}
              {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}

              <div className="mt-5 flex justify-end gap-3">
                <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                  Reset
                </button>
                <button
                  onClick={run}
                  disabled={busy || files.length === 0}
                  className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
                >
                  {busy ? "Numbering…" : `Number ${files.length} file${files.length === 1 ? "" : "s"} (.zip)`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
