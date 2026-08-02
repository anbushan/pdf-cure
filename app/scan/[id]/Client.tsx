"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Page {
  id: string;
  thumb: string;
}

async function compressImage(file: File, maxDim = 1600, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

type Phase = "loading" | "capturing" | "saving" | "done" | "expired";

export default function ScanCaptureClient({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [pages, setPages] = useState<Page[]>([]);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/scan-session/${sessionId}/connect`, { method: "POST" });
        if (!res.ok) {
          setPhase("expired");
          return;
        }
        setPhase("capturing");
      } catch {
        setPhase("expired");
      }
    })();
  }, [sessionId]);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const res = await fetch(`/api/scan-session/${sessionId}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't upload that page.");
      setPages((p) => [...p, { id: data.id, thumb: dataUrl }]);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't upload that page.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removePage(id: string) {
    setPages((p) => p.filter((pg) => pg.id !== id));
    try {
      await fetch(`/api/scan-session/${sessionId}/image/${id}`, { method: "DELETE" });
    } catch {
      // page is already gone from the UI; a stray row will clean up when the session expires
    }
  }

  async function handleSave() {
    if (pages.length === 0) {
      toast.error("Scan at least one page first.");
      return;
    }
    setPhase("saving");
    try {
      const res = await fetch(`/api/scan-session/${sessionId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't finish this scan.");
      setPhase("done");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't finish this scan.");
      setPhase("capturing");
    }
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-sm px-6 py-16 text-center">
        <p className="text-sm text-ink-faint">Connecting…</p>
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="mx-auto max-w-sm px-6 py-16 text-center">
        <AlertCircle className="mx-auto text-rust-dark" size={28} />
        <p className="mt-3 text-sm text-ink-faint">
          This scan link has expired. Go back to your computer and refresh the page to get a new QR code.
        </p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-sm px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal-dark">
          <Check size={24} />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink">All set</h1>
        <p className="mt-1.5 text-sm text-ink-faint">
          Your {pages.length} page{pages.length === 1 ? "" : "s"} {pages.length === 1 ? "is" : "are"} ready on your
          computer. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-8 pb-28">
      <h1 className="font-display text-xl font-semibold text-ink text-center">Scan documents</h1>
      <p className="mt-1.5 text-sm text-ink-faint text-center">
        Capture each page, then tap Save when you're done.
      </p>

      {pages.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          {pages.map((p, i) => (
            <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-md border border-paper-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
              <button
                onClick={() => removePage(p.id)}
                aria-label={`Remove page ${i + 1}`}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-paper"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading || phase === "saving"}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-paper-line py-5 text-sm font-semibold text-ink hover:border-amber-dark transition-colors disabled:opacity-60"
      >
        <Camera size={18} /> {uploading ? "Uploading…" : pages.length ? "Scan another page" : "Scan a page"}
      </button>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-paper-line bg-paper px-6 py-4">
        <button
          onClick={handleSave}
          disabled={phase === "saving" || pages.length === 0}
          className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-md bg-amber py-3 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors disabled:opacity-50"
        >
          {phase === "saving" ? "Saving…" : `Save${pages.length ? ` (${pages.length})` : ""}`}
        </button>
      </div>
    </div>
  );
}
