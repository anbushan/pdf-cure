"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { compressToTargetSize, CompressToSizeResult } from "@/lib/pdfTools";
import { downloadPdf, formatBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("compress-to-size")!;

const PRESETS_MB = [5, 10, 25];

export default function CompressToSizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetMb, setTargetMb] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<CompressToSizeResult | null>(null);

  async function handleCompress() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await compressToTargetSize(file, targetMb * 1024 * 1024);
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't compress this PDF.");
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
          <ResultPanel previewBytes={result.bytes}
            title={result.achieved ? `Fits under ${targetMb} MB` : `Couldn't get under ${targetMb} MB`}
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)}${
              result.achieved ? "" : " — this is as small as it gets without losing too much"
            }`}
            onDownload={() => downloadPdf(result.bytes, `${stripExt(file!.name)}_compressed.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to compress" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6">
            <FilePreview file={file} className="mb-4" />
            <p className="mt-4 text-sm font-medium text-ink">Target size</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {PRESETS_MB.map((mb) => (
                <button
                  key={mb}
                  onClick={() => setTargetMb(mb)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                    targetMb === mb ? "border-amber bg-amber-light text-amber-dark" : "border-paper-line text-ink-faint hover:text-ink"
                  }`}
                >
                  {mb} MB
                </button>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={targetMb}
                  onChange={(e) => setTargetMb(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
                />
                <span className="text-sm text-ink-faint">MB</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              This steps through progressively smaller image quality and resolution until the file fits your target — the same
              re-render technique Compress PDF uses, just repeated automatically. Original size is {file ? formatBytes(file.size) : ""}.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleCompress}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Compressing…" : `Compress under ${targetMb} MB`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
