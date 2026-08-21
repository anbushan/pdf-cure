"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { resizePdf, type PageSizeTarget } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("resize-pdf")!;

const SIZES: { value: PageSizeTarget; label: string }[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
  { value: "legal", label: "Legal" },
  { value: "a3", label: "A3" },
];

export default function ResizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<PageSizeTarget>("a4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleResize() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await resizePdf(file, target);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't resize this PDF.");
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
          <ResultPanel
            title="Your PDF has been resized"
            detail={`Every page rescaled to ${target.toUpperCase()}`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_${target}.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />

            <p className="mt-5 text-sm font-medium text-ink">Target page size</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setTarget(s.value)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    target === s.value ? "border-amber bg-amber-light/40" : "border-paper-line text-ink-faint hover:border-ink-faint/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              Every page is scaled uniformly to fit the new size and centered — nothing is stretched or cropped.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleResize}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Resizing…" : "Resize PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
