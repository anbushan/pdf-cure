"use client";

import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { ID_PHOTO_PRESETS, buildIdPhoto } from "@/lib/idPhoto";
import { stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { trackEvent } from "@/lib/analytics";

const tool = getTool("id-photo")!;

const BG_COLORS = [
  { label: "White", hex: "#ffffff" },
  { label: "Light gray", hex: "#e5e5e5" },
  { label: "Blue", hex: "#4a90d9" },
  { label: "Red", hex: "#c0392b" },
];

export default function IdPhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [presetIndex, setPresetIndex] = useState(0);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [bgColor, setBgColor] = useState(BG_COLORS[0].hex);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);

  const preset = ID_PHOTO_PRESETS[presetIndex];

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let url: string | null = null;
    setBusy(true);
    buildIdPhoto(file, preset, fitMode, bgColor)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setError(null);
      })
      .catch((e) => !cancelled && setError(e?.message ?? "Couldn't generate a preview."))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, presetIndex, fitMode, bgColor]);

  async function handleDownload() {
    if (!file) return;
    try {
      const blob = await buildIdPhoto(file, preset, fitMode, bgColor);
      saveAs(blob, `${stripExt(file.name)}_id_photo.png`);
      trackEvent("tool_success", { page: "/tools/id-photo" });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't generate the photo.");
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {!file ? (
          <Dropzone accept="image/jpeg,image/png" label="Select a photo" hint="A clear, front-facing photo works best" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6">
            <div className="mx-auto flex flex-col items-center gap-2">
              <div
                className="flex items-center justify-center overflow-hidden rounded border border-paper-line bg-paper-dim"
                style={{ width: 160, height: (160 * preset.heightPx) / preset.widthPx, backgroundColor: bgColor }}
              >
                {previewUrl && <img src={previewUrl} alt="ID photo preview" className="h-full w-full object-contain" />}
              </div>
              <p className="text-xs text-ink-faint">
                {preset.widthPx} × {preset.heightPx} px
              </p>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-ink">Size</label>
              <select
                value={presetIndex}
                onChange={(e) => setPresetIndex(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
              >
                {ID_PHOTO_PRESETS.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Fit</label>
                <div className="mt-1.5 inline-flex w-full rounded-md border border-paper-line p-0.5">
                  <button
                    onClick={() => setFitMode("cover")}
                    className={`flex-1 rounded px-2 py-1.5 text-xs font-medium ${fitMode === "cover" ? "bg-amber text-ink" : "text-ink-faint hover:text-ink"}`}
                  >
                    Fill frame
                  </button>
                  <button
                    onClick={() => setFitMode("contain")}
                    className={`flex-1 rounded px-2 py-1.5 text-xs font-medium ${fitMode === "contain" ? "bg-amber text-ink" : "text-ink-faint hover:text-ink"}`}
                  >
                    Fit inside
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Background</label>
                <div className="mt-2 flex gap-1.5">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setBgColor(c.hex)}
                      title={c.label}
                      className={`h-7 w-7 rounded-full border-2 ${bgColor === c.hex ? "border-ink" : "border-paper-line"}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-faint">
              "Fill frame" crops the photo to cover the whole frame with no margin — the usual choice for a headshot. "Fit inside"
              shrinks it to show the whole photo, filling any leftover margin with the background color. This crops and resizes only —
              it doesn't remove the background behind the subject.
            </p>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Choose a different photo
              </button>
              <button
                onClick={handleDownload}
                disabled={busy || !previewUrl}
                className="rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                Download PNG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
