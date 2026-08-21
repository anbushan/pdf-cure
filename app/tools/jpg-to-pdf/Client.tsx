"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { buildPdfFromImages } from "@/lib/pdfTools";
import { downloadPdf } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { X } from "lucide-react";

const tool = getTool("jpg-to-pdf")!;

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"auto" | "a4" | "letter">("auto");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type.startsWith("image/"))]);
  }

  function remove(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleConvert() {
    setBusy(true);
    setError(null);
    try {
      const bytes = await buildPdfFromImages(files, { fitMode: "fit", pageSize });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert these images.");
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
            title="Your images have been converted"
            detail={`${files.length} page${files.length === 1 ? "" : "s"}`}
            onDownload={() => downloadPdf(result, "images.pdf")}
            onReset={reset}
          />
        ) : files.length === 0 ? (
          <Dropzone accept="image/jpeg,image/png" multiple label="Add JPG or PNG images" hint="One page per image, in the order you add them" onFiles={addFiles} />
        ) : (
          <div className="paper-stack p-6">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {files.map((f, i) => (
                <div key={i} className="relative rounded-md overflow-hidden border border-paper-line">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="aspect-square w-full object-cover" />
                  <button onClick={() => remove(i)} className="absolute top-1 right-1 rounded-full bg-ink/70 p-1 text-white hover:bg-rust">
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-ink/70 px-1.5 py-0.5 text-[10px] font-mono text-paper truncate">
                    {i + 1}
                  </div>
                </div>
              ))}
              <label className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-paper-line text-xs text-ink-faint cursor-pointer hover:border-ink-faint/50">
                + Add
                <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
              </label>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-ink mb-2">Page size</p>
              <div className="flex gap-2">
                {(["auto", "a4", "letter"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      pageSize === s ? "border-amber bg-amber-light/40" : "border-paper-line text-ink-faint hover:border-ink-faint/40"
                    }`}
                  >
                    {s === "auto" ? "Match image" : s}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-rust-dark">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Converting…" : `Convert ${files.length} image${files.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
