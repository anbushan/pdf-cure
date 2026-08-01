"use client";

import { getPdfjs } from "./pdfjs";

export interface RenderedPage {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Renders every page (or a subset) of a PDF file to JPEG data URLs.
 * scale controls resolution: ~0.35 for thumbnails, ~1.5-2 for exports.
 */
export async function renderPdfPages(
  file: File | ArrayBuffer,
  scale: number,
  pageIndices?: number[],
  quality = 0.85
): Promise<RenderedPage[]> {
  const pdfjsLib = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) });
  const pdf = await loadingTask.promise;

  const total = pdf.numPages;
  const indices = pageIndices ?? Array.from({ length: total }, (_, i) => i);

  const results: RenderedPage[] = [];
  for (const i of indices) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    results.push({
      index: i,
      dataUrl: canvas.toDataURL("image/jpeg", quality),
      width: canvas.width,
      height: canvas.height,
    });
  }
  return results;
}

export async function getPdfPageCount(file: File | ArrayBuffer): Promise<number> {
  const pdfjsLib = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return pdf.numPages;
}
