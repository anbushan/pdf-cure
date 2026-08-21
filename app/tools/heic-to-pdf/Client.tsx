"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { buildPdfFromImages, heicToJpegFile } from "@/lib/pdfTools";
import { downloadPdf } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { X, Loader2, AlertCircle } from "lucide-react";

const tool = getTool("heic-to-pdf")!;

interface Item {
  id: string;
  name: string;
  status: "converting" | "ready" | "error";
  jpegFile?: File;
  errorMsg?: string;
}

function isHeic(file: File): boolean {
  return /\.(heic|heif)$/i.test(file.name);
}

export default function HeicToPdfPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<"auto" | "a4" | "letter">("auto");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);

  function addFiles(newFiles: File[]) {
    const heicFiles = newFiles.filter(isHeic);
    const newItems: Item[] = heicFiles.map((f) => ({ id: crypto.randomUUID(), name: f.name, status: "converting" }));
    setItems((prev) => [...prev, ...newItems]);

    newItems.forEach((item, i) => {
      heicToJpegFile(heicFiles[i])
        .then((jpegFile) => {
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "ready", jpegFile } : it)));
        })
        .catch((e: any) => {
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, status: "error", errorMsg: e?.message ?? "Couldn't decode this photo." } : it))
          );
        });
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const readyFiles = items.filter((it) => it.status === "ready" && it.jpegFile).map((it) => it.jpegFile!);
  const converting = items.some((it) => it.status === "converting");

  async function handleConvert() {
    setBusy(true);
    setError(null);
    try {
      const bytes = await buildPdfFromImages(readyFiles, { fitMode: "fit", pageSize });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert these photos.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setItems([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-3xl px-6 mt-8">
        {result ? (
          <ResultPanel previewBytes={result}
            title="Your photos have been converted"
            detail={`${readyFiles.length} page${readyFiles.length === 1 ? "" : "s"}`}
            onDownload={() => downloadPdf(result, "photos.pdf")}
            onReset={reset}
          />
        ) : items.length === 0 ? (
          <Dropzone
            accept=".heic,.heif,image/heic,image/heif"
            multiple
            label="Add HEIC or HEIF photos"
            hint="iPhone photos — converted to JPEG right in your browser, then built into a PDF"
            onFiles={addFiles}
          />
        ) : (
          <div className="paper-stack p-6">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((it) => (
                <div key={it.id} className="relative rounded-md overflow-hidden border border-paper-line">
                  {it.status === "ready" && it.jpegFile ? (
                    <img src={URL.createObjectURL(it.jpegFile)} alt={it.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 bg-paper-dim px-2 text-center">
                      {it.status === "converting" ? (
                        <Loader2 size={18} className="animate-spin text-ink-faint" />
                      ) : (
                        <AlertCircle size={18} className="text-rust-dark" />
                      )}
                      <span className="text-[10px] text-ink-faint truncate w-full">
                        {it.status === "converting" ? "Converting…" : it.errorMsg ?? "Failed"}
                      </span>
                    </div>
                  )}
                  <button onClick={() => remove(it.id)} className="absolute top-1 right-1 rounded-full bg-ink/70 p-1 text-white hover:bg-rust">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-paper-line text-xs text-ink-faint cursor-pointer hover:border-ink-faint/50">
                + Add
                <input
                  type="file"
                  accept=".heic,.heif,image/heic,image/heif"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                />
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
                    {s === "auto" ? "Match photo" : s}
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
                disabled={busy || converting || readyFiles.length === 0}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Converting…" : converting ? "Decoding photos…" : `Convert ${readyFiles.length} photo${readyFiles.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
