"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import FilePreview from "@/components/FilePreview";
import ResultPanel from "@/components/ResultPanel";
import { removeImageBackground } from "@/lib/backgroundRemoval";
import { downloadBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("remove-background")!;

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<{ bytes: Uint8Array; previewUrl: string } | null>(null);

  async function handleRemove() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await removeImageBackground(file);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      setResult({ bytes, previewUrl: URL.createObjectURL(blob) });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't remove the background from this image.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (result) URL.revokeObjectURL(result.previewUrl);
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <div className="paper-stack p-8 text-center">
            <div
              className="mx-auto max-w-sm overflow-hidden rounded-md border border-paper-line"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.previewUrl} alt="Background removed" className="mx-auto max-h-80 w-auto" />
            </div>
            <ResultPanel
              title="Background removed"
              onDownload={() => downloadBytes(result.bytes, `${stripExt(file!.name)}_transparent.png`, "image/png")}
              onReset={reset}
              downloadLabel="Download PNG"
            />
          </div>
        ) : !file ? (
          <Dropzone accept="image/*" label="Select a photo" hint="JPG, PNG, or WebP" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />
            <p className="mt-3 text-xs text-ink-faint">
              Runs entirely in your browser using an on-device AI model — your photo is never uploaded anywhere. The
              first use downloads that model (a few MB); after that it works offline, the same way the OCR tool's
              engine does.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                <Wand2 size={15} /> {busy ? "Removing background…" : "Remove background"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
