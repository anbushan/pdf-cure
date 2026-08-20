"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { addImageWatermark } from "@/lib/pdfTools";
import { downloadPdf, stripExt, fileToDataUrl } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("image-watermark")!;

export default function ImageWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.25);
  const [widthPercent, setWidthPercent] = useState(40);
  const [rotation, setRotation] = useState(45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleImage(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    try {
      setImage(await fileToDataUrl(picked));
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read the image.");
    }
  }

  async function handleApply() {
    if (!file || !image) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await addImageWatermark(file, image, {
        opacity,
        widthPercent,
        rotationDeg: rotation,
      });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't add the watermark.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setImage(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Watermark applied"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_watermarked.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to watermark" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 space-y-5">
            <FilePreview file={file} />

            {!image ? (
              <Dropzone accept="image/jpeg,image/png" label="Select a logo or image" hint="JPG or PNG" onFiles={handleImage} />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <img src={image} alt="Watermark image" className="h-14 w-14 rounded-md border border-paper-line object-contain bg-white" />
                  <button onClick={() => setImage(null)} className="text-xs font-medium text-rust-dark hover:underline">
                    Choose a different image
                  </button>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Opacity — {Math.round(opacity * 100)}%</label>
                  <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1.5 w-full accent-rust-dark" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Size — {widthPercent}% of page width</label>
                  <input type="range" min={5} max={90} value={widthPercent} onChange={(e) => setWidthPercent(Number(e.target.value))} className="mt-1.5 w-full accent-rust-dark" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Rotation — {rotation}°</label>
                  <input type="range" min={0} max={360} step={5} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="mt-1.5 w-full accent-rust-dark" />
                </div>
              </>
            )}

            {error && <p className="text-sm text-rust-dark">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!image || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Add watermark"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
