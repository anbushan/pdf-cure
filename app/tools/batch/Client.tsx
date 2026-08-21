"use client";

import { useState } from "react";
import { GripVertical, X, FileText, CheckCircle2, XCircle } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { compressPdf, addWatermark, protectPdf, unlockPdf } from "@/lib/pdfTools";
import { formatBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { trackEvent } from "@/lib/analytics";

const tool = getTool("batch")!;

type Operation = "compress" | "watermark" | "protect" | "unlock";

const SUFFIX: Record<Operation, string> = {
  compress: "_compressed",
  watermark: "_watermarked",
  protect: "_protected",
  unlock: "_unlocked",
};

interface ResultItem {
  name: string;
  status: "done" | "error";
  bytes?: Uint8Array;
  error?: string;
}

export default function BatchPage() {
  const [operation, setOperation] = useState<Operation>("compress");
  const [files, setFiles] = useState<File[]>([]);
  const [compressLevel, setCompressLevel] = useState<"low" | "medium" | "high">("medium");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
    setResults(null);
  }
  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setResults(null);
  }

  function validate(): string | null {
    if (files.length === 0) return "Add at least one PDF.";
    if (operation === "watermark" && !watermarkText.trim()) return "Enter watermark text.";
    if (operation === "protect") {
      if (!password) return "Enter a password.";
      if (password !== confirmPassword) return "Passwords don't match.";
    }
    if (operation === "unlock" && !password) return "Enter the password these files are locked with.";
    return null;
  }

  async function runBatch() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setRunning(true);
    setResults(null);
    const out: ResultItem[] = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i);
      const f = files[i];
      try {
        let bytes: Uint8Array;
        if (operation === "compress") {
          bytes = (await compressPdf(f, compressLevel)).bytes;
        } else if (operation === "watermark") {
          bytes = await addWatermark(f, { text: watermarkText, opacity: 0.25, fontSize: 48, rotation: 45, color: [0.11, 0.13, 0.16] });
        } else if (operation === "protect") {
          bytes = await protectPdf(f, password);
        } else {
          bytes = await unlockPdf(f, password);
        }
        out.push({ name: f.name, status: "done", bytes });
      } catch (e: any) {
        out.push({ name: f.name, status: "error", error: e?.message ?? "Something went wrong." });
      }
    }

    setResults(out);
    setRunning(false);
    if (out.some((r) => r.status === "done")) trackEvent("tool_success", { page: "/tools/batch", operation });
  }

  async function downloadZip() {
    const successes = (results ?? []).filter((r) => r.status === "done" && r.bytes) as (ResultItem & { bytes: Uint8Array })[];
    if (successes.length === 0) return;
    const { default: JSZip } = await import("jszip");
    const { saveAs } = await import("file-saver");
    const zip = new JSZip();
    successes.forEach((r) => zip.file(`${stripExt(r.name)}${SUFFIX[operation]}.pdf`, r.bytes));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `batch${SUFFIX[operation]}.zip`);
  }

  function reset() {
    setFiles([]);
    setResults(null);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  const doneCount = results?.filter((r) => r.status === "done").length ?? 0;
  const errorCount = results?.filter((r) => r.status === "error").length ?? 0;

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        <div className="paper-stack p-6">
          <label className="text-sm font-medium text-ink">Operation</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["compress", "watermark", "protect", "unlock"] as Operation[]).map((op) => (
              <button
                key={op}
                onClick={() => {
                  setOperation(op);
                  setResults(null);
                }}
                className={`rounded-md border px-3 py-2 text-sm font-medium capitalize ${
                  operation === op ? "border-amber bg-amber-light text-amber-dark" : "border-paper-line text-ink-faint hover:text-ink"
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {operation === "compress" && (
              <div>
                <label className="text-sm font-medium text-ink">Compression level</label>
                <select
                  value={compressLevel}
                  onChange={(e) => setCompressLevel(e.target.value as any)}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                >
                  <option value="low">Low — best quality</option>
                  <option value="medium">Medium — balanced</option>
                  <option value="high">High — smallest file</option>
                </select>
              </div>
            )}
            {operation === "watermark" && (
              <div>
                <label className="text-sm font-medium text-ink">Watermark text</label>
                <input
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
            )}
            {operation === "protect" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-ink">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>
            )}
            {operation === "unlock" && (
              <div>
                <label className="text-sm font-medium text-ink">Password these files are locked with</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <p className="mt-1 text-xs text-ink-faint">The same password is tried on every file — files with a different password will be skipped and reported as failed.</p>
              </div>
            )}
          </div>

          <div className="mt-5">
            {files.length === 0 ? (
              <Dropzone accept="application/pdf" multiple label="Add PDFs to process" hint="Choose as many as you like" onFiles={addFiles} />
            ) : (
              <>
                <ul className="divide-y divide-paper-line border-t border-b border-paper-line">
                  {files.map((f, i) => {
                    const r = results?.[i];
                    return (
                      <li key={i} className="flex items-center gap-3 py-2.5">
                        {running && currentIndex === i ? (
                          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-dark border-t-transparent" />
                        ) : r?.status === "done" ? (
                          <CheckCircle2 size={16} className="shrink-0 text-teal-dark" />
                        ) : r?.status === "error" ? (
                          <XCircle size={16} className="shrink-0 text-rust-dark" />
                        ) : (
                          <GripVertical size={16} className="shrink-0 text-ink-faint" />
                        )}
                        <FileText size={15} className="shrink-0 text-ink-faint" />
                        <span className="flex-1 truncate text-sm font-mono">{f.name}</span>
                        {r?.status === "error" ? (
                          <span className="shrink-0 text-xs text-rust-dark">{r.error}</span>
                        ) : (
                          <span className="shrink-0 text-xs text-ink-faint">{formatBytes(f.size)}</span>
                        )}
                        {!running && (
                          <button onClick={() => removeFile(i)} className="shrink-0 p-1 text-ink-faint hover:text-rust-dark">
                            <X size={14} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {!running && (
                  <label className="mt-3 inline-block cursor-pointer text-sm font-medium text-amber-dark">
                    + Add more files
                    <input type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
                  </label>
                )}
              </>
            )}
          </div>

          {results && (
            <p className="mt-4 text-sm text-ink">
              {doneCount} succeeded{errorCount > 0 ? `, ${errorCount} failed` : ""}.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}

          <div className="mt-5 flex justify-end gap-3">
            <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
              Reset
            </button>
            {results && doneCount > 0 ? (
              <button onClick={downloadZip} className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark">
                Download {doneCount} file{doneCount === 1 ? "" : "s"} (.zip)
              </button>
            ) : (
              <button
                onClick={runBatch}
                disabled={files.length === 0 || running}
                className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
              >
                {running ? `Processing ${currentIndex + 1} of ${files.length}…` : `Process ${files.length || ""} file${files.length === 1 ? "" : "s"}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
