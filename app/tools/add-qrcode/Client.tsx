"use client";

import { useState } from "react";
import { RotateCw, Trash2, QrCode } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { placeImageOnPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("add-qrcode")!;

export default function AddQrCodePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [text, setText] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [x, setX] = useState(65);
  const [y, setY] = useState(70);
  const [width, setWidth] = useState(20);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 0.6);

  async function handleGenerate() {
    if (!text.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(text.trim(), { width: 512, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } });
      setQr(dataUrl);
      setRotation(0);
      setSelected(false);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't generate a QR code from that text.");
    } finally {
      setGenerating(false);
    }
  }

  function removeQr() {
    setQr(null);
    setText("");
    setSelected(false);
    setRotation(0);
  }

  async function handleApply() {
    if (!file || !qr) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await placeImageOnPdf(file, qr, {
        pageIndex,
        xPercent: x,
        yPercent: y,
        widthPercent: width,
        rotationDeg: rotation,
      });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't add the QR code.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    removeQr();
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel title="QR code added" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_qrcode.pdf`)} onReset={reset} />
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
              {qr && (
                <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${width}%` }}>
                  <img
                    src={qr}
                    alt="QR code to place"
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
                        onClick={removeQr}
                        title="Remove QR code"
                        className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!qr ? (
              <div className="mt-5">
                <label className="text-sm font-medium text-ink">Link or text to encode</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="https://example.com"
                    className="flex-1 rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!text.trim() || generating}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
                  >
                    <QrCode size={14} /> {generating ? "Generating…" : "Generate"}
                  </button>
                </div>
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
                    <input type="range" min={5} max={60} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-amber-dark" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink-faint">
                  Drag the sliders to position and resize the QR code. Click it on the preview to rotate or remove it.
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
                disabled={!qr || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Add QR code"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
