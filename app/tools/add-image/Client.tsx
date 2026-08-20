"use client";

import { useState } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { placeImageOnPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt, fileToDataUrl } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("add-image")!;

export default function AddImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [x, setX] = useState(20);
  const [y, setY] = useState(20);
  const [width, setWidth] = useState(35);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 0.6);

  async function handleImage(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    try {
      setImage(await fileToDataUrl(picked));
      setRotation(0);
      setSelected(false);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read the image.");
    }
  }

  function removeImage() {
    setImage(null);
    setSelected(false);
    setRotation(0);
  }

  async function handleApply() {
    if (!file || !image) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await placeImageOnPdf(file, image, {
        pageIndex,
        xPercent: x,
        yPercent: y,
        widthPercent: width,
        rotationDeg: rotation,
      });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't add the image.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    removeImage();
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel title="Image added" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_image.pdf`)} onReset={reset} />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={(f) => setFile(f[0])} />
        ) : loading ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering preview…</p>
        ) : (
          <div className="paper-stack p-6">
            {pages.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-ink">Page</label>
                <select
                  value={pageIndex}
                  onChange={(e) => setPageIndex(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                >
                  {pages.map((p) => (
                    <option key={p.index} value={p.index}>
                      Page {p.index + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div
              className="relative mx-auto w-full max-w-sm overflow-visible rounded border border-paper-line"
              onClick={() => setSelected(false)}
            >
              <img src={pages[pageIndex]?.dataUrl} alt="Page preview" className="block w-full rounded" />
              {image && (
                <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${width}%` }}>
                  <img
                    src={image}
                    alt="Image to place"
                    className="block w-full cursor-pointer outline-2 outline-offset-2 outline-amber-dark"
                    style={{ transform: `rotate(${rotation}deg)`, outlineStyle: selected ? "solid" : "none" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected((s) => !s);
                    }}
                  />
                  {selected && (
                    <div
                      className="absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-ink px-1.5 py-1 shadow-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        title="Rotate 90°"
                        className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20"
                      >
                        <RotateCw size={13} />
                      </button>
                      <button
                        onClick={removeImage}
                        title="Remove image"
                        className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!image ? (
              <div className="mt-5">
                <Dropzone accept="image/jpeg,image/png" label="Select an image" hint="JPG or PNG" onFiles={handleImage} />
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-faint">X — {x}%</label>
                    <input type="range" min={0} max={90} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full accent-amber-dark" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-faint">Y — {y}%</label>
                    <input type="range" min={0} max={90} value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full accent-amber-dark" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-faint">Size — {width}%</label>
                    <input type="range" min={10} max={90} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-amber-dark" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink-faint">
                  Drag the sliders to position and resize the image — it's automatically scaled to fit within the page, keeping its original proportions.
                  Click the image on the preview to rotate or remove it.
                </p>
              </>
            )}

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!image || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Add image"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
