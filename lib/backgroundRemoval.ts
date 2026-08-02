"use client";

/**
 * Lazy-loaded like pdfjs/pdf-lib elsewhere in this app — @imgly/background-removal
 * pulls in an ONNX runtime + WASM segmentation model (a few MB), so nothing
 * loads until someone actually uses this tool. The model itself is fetched
 * from IMG.LY's CDN on first use (same "one-time engine download, then it
 * works offline" pattern as the OCR tool's Tesseract engine) — the image
 * being processed never leaves the browser, only that one-time generic
 * model download talks to a third party.
 */
export async function removeImageBackground(file: File): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file);
}
