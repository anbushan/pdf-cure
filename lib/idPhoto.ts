"use client";

export interface IdPhotoPreset {
  label: string;
  widthPx: number;
  heightPx: number;
}

/** Common ID/passport sizes, rendered at ~300 DPI so they print sharp. */
export const ID_PHOTO_PRESETS: IdPhotoPreset[] = [
  { label: "Passport / Visa photo (2×2 in)", widthPx: 600, heightPx: 600 },
  { label: "India passport (35×45 mm)", widthPx: 413, heightPx: 531 },
  { label: "PAN card (25×35 mm)", widthPx: 295, heightPx: 413 },
  { label: "Exam admit card (35×45 mm)", widthPx: 413, heightPx: 531 },
  { label: "Square avatar (1×1 in)", widthPx: 300, heightPx: 300 },
];

function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}

/**
 * Crops/resizes a photo onto a canvas sized exactly to the target preset.
 * "Fill" scales the photo up to cover the whole frame (cropping any excess,
 * the usual choice for a headshot); "Fit" scales it down to fit entirely
 * inside the frame, showing the background color in any leftover margin.
 * This only fills the margin around the photo — it doesn't remove the
 * background behind the subject, which needs the AI Image Background
 * Remover instead.
 */
export async function buildIdPhoto(file: File, preset: IdPhotoPreset, fitMode: "cover" | "contain", bgColor: string): Promise<Blob> {
  const img = await loadImageFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = preset.widthPx;
  canvas.height = preset.heightPx;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale =
    fitMode === "cover"
      ? Math.max(canvas.width / img.width, canvas.height / img.height)
      : Math.min(canvas.width / img.width, canvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't generate the photo."))), "image/png")
  );
}
