"use client";

import { useEffect, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { usePdfThumbnails } from "@/lib/usePdfThumbnails";
import { buildOrganizedPdf, OrganizePage } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { ArrowLeft, ArrowRight, RotateCw, Trash2 } from "lucide-react";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("organize")!;

interface Item extends OrganizePage {
  key: string;
}

export default function OrganizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const { pages, loading } = usePdfThumbnails(file);

  useEffect(() => {
    if (pages.length) {
      setItems(pages.map((p) => ({ originalIndex: p.index, rotation: 0, key: `${p.index}` })));
    }
  }, [pages]);

  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = i + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  function rotate(i: number) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], rotation: (((next[i].rotation + 90) % 360) as 0 | 90 | 180 | 270) };
      return next;
    });
  }

  function del(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (items.length === 0) throw new Error("Your document needs at least one page.");
      const bytes = await buildOrganizedPdf(file, items);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't organize this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setItems([]);
    setResult(null);
    setError(null);
  }

  const pageByIndex = new Map(pages.map((p) => [p.index, p]));

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-3xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Your PDF has been reorganized"
            detail={`${items.length} pages`}
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_organized.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to organize" hint="Reorder, rotate, or delete pages" onFiles={(f) => setFile(f[0])} />
        ) : loading ? (
          <p className="text-sm text-ink-faint py-10 text-center">Rendering pages…</p>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((item, i) => {
                const p = pageByIndex.get(item.originalIndex);
                if (!p) return null;
                return (
                  <div key={item.key} className="paper-stack p-2">
                    <div className="overflow-hidden rounded">
                      <img
                        src={p.dataUrl}
                        alt={`Page ${item.originalIndex + 1}`}
                        className="w-full block"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-ink-faint">#{i + 1} · pg {item.originalIndex + 1}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-ink-faint hover:text-ink disabled:opacity-30"><ArrowLeft size={13} /></button>
                        <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 text-ink-faint hover:text-ink disabled:opacity-30"><ArrowRight size={13} /></button>
                        <button onClick={() => rotate(i)} className="p-1 text-ink-faint hover:text-ink"><RotateCw size={13} /></button>
                        <button onClick={() => del(i)} className="p-1 text-rust hover:text-rust-dark"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {error && <p className="mt-4 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={busy}
                className="rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
