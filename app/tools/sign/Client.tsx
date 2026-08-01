"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import SignaturePad from "@/components/SignaturePad";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { placeSignature } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("sign")!;

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);
  const [x, setX] = useState(60);
  const [y, setY] = useState(80);
  const [width, setWidth] = useState(28);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file, 0.6);

  async function handleApply() {
    if (!file || !signature) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await placeSignature(file, signature, {
        pageIndex,
        xPercent: x,
        yPercent: y,
        widthPercent: width,
      });
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't place the signature.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setSignature(null);
    setResult(null);
    setError(null);
    setPageIndex(0);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel title="Signature added" onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_signed.pdf`)} onReset={reset} />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to sign" onFiles={(f) => setFile(f[0])} />
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

            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded border border-paper-line">
              <img src={pages[pageIndex]?.dataUrl} alt="Page preview" className="block w-full" />
              {signature && (
                <img
                  src={signature}
                  alt="Signature"
                  className="absolute pointer-events-none"
                  style={{ left: `${x}%`, top: `${y}%`, width: `${width}%` }}
                />
              )}
            </div>

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
                <input type="range" min={10} max={70} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-amber-dark" />
              </div>
            </div>

            <div className="mt-5">
              <SignaturePad onChange={setSignature} />
            </div>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!signature || busy}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                {busy ? "Applying…" : "Add signature"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
