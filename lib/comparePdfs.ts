"use client";

import { renderPdfPages } from "./pdfRender";
import { getPdfPageCount } from "./pdfRender";

export interface PageComparison {
  pageIndex: number;
  imageA: string | null;
  imageB: string | null;
  diffImage: string | null;
  diffPercent: number; // 0-100
  status: "same" | "different" | "only-a" | "only-b";
}

export interface CompareResult {
  pageCount: number;
  pagesA: number;
  pagesB: number;
  comparisons: PageComparison[];
}

/**
 * Renders matching pages from both PDFs at the same scale, then does a
 * plain per-pixel absolute-difference comparison (no external diff
 * library needed — this keeps the bundle small). Differences are
 * highlighted in red on a dimmed copy of page A.
 */
export async function comparePdfs(
  fileA: File,
  fileB: File,
  onProgress?: (done: number, total: number) => void
): Promise<CompareResult> {
  const [pagesA, pagesB] = await Promise.all([getPdfPageCount(fileA), getPdfPageCount(fileB)]);
  const maxPages = Math.max(pagesA, pagesB);
  const scale = 1.1;

  const [renderedA, renderedB] = await Promise.all([
    renderPdfPages(fileA, scale, Array.from({ length: pagesA }, (_, i) => i)),
    renderPdfPages(fileB, scale, Array.from({ length: pagesB }, (_, i) => i)),
  ]);

  const comparisons: PageComparison[] = [];

  for (let i = 0; i < maxPages; i++) {
    const a = renderedA[i];
    const b = renderedB[i];
    onProgress?.(i + 1, maxPages);

    if (a && !b) {
      comparisons.push({ pageIndex: i, imageA: a.dataUrl, imageB: null, diffImage: null, diffPercent: 100, status: "only-a" });
      continue;
    }
    if (!a && b) {
      comparisons.push({ pageIndex: i, imageA: null, imageB: b.dataUrl, diffImage: null, diffPercent: 100, status: "only-b" });
      continue;
    }
    if (!a || !b) continue;

    const { diffDataUrl, diffPercent } = await diffImages(a.dataUrl, b.dataUrl, a.width, a.height, b.width, b.height);
    comparisons.push({
      pageIndex: i,
      imageA: a.dataUrl,
      imageB: b.dataUrl,
      diffImage: diffDataUrl,
      diffPercent,
      status: diffPercent < 0.15 ? "same" : "different",
    });
  }

  return { pageCount: maxPages, pagesA, pagesB, comparisons };
}

async function diffImages(
  srcA: string,
  srcB: string,
  wA: number,
  hA: number,
  wB: number,
  hB: number
): Promise<{ diffDataUrl: string; diffPercent: number }> {
  const width = Math.max(wA, wB);
  const height = Math.max(hA, hB);

  const canvasA = document.createElement("canvas");
  canvasA.width = width;
  canvasA.height = height;
  const ctxA = canvasA.getContext("2d")!;
  ctxA.fillStyle = "#ffffff";
  ctxA.fillRect(0, 0, width, height);
  ctxA.drawImage(await loadImage(srcA), 0, 0, wA, hA);

  const canvasB = document.createElement("canvas");
  canvasB.width = width;
  canvasB.height = height;
  const ctxB = canvasB.getContext("2d")!;
  ctxB.fillStyle = "#ffffff";
  ctxB.fillRect(0, 0, width, height);
  ctxB.drawImage(await loadImage(srcB), 0, 0, wB, hB);

  const dataA = ctxA.getImageData(0, 0, width, height);
  const dataB = ctxB.getImageData(0, 0, width, height);

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const outCtx = out.getContext("2d")!;
  const outData = outCtx.createImageData(width, height);

  const threshold = 32; // per-channel difference before a pixel counts as "changed"
  let changedPixels = 0;
  const totalPixels = width * height;

  for (let p = 0; p < totalPixels; p++) {
    const idx = p * 4;
    const dr = Math.abs(dataA.data[idx] - dataB.data[idx]);
    const dg = Math.abs(dataA.data[idx + 1] - dataB.data[idx + 1]);
    const db = Math.abs(dataA.data[idx + 2] - dataB.data[idx + 2]);
    const changed = dr > threshold || dg > threshold || db > threshold;

    if (changed) {
      changedPixels++;
      // highlight in red
      outData.data[idx] = 209;
      outData.data[idx + 1] = 33;
      outData.data[idx + 2] = 33;
      outData.data[idx + 3] = 255;
    } else {
      // dimmed grayscale base so the red really pops
      const gray = (dataA.data[idx] + dataA.data[idx + 1] + dataA.data[idx + 2]) / 3;
      const dimmed = 235 + gray * 0.08;
      outData.data[idx] = dimmed;
      outData.data[idx + 1] = dimmed;
      outData.data[idx + 2] = dimmed;
      outData.data[idx + 3] = 255;
    }
  }

  outCtx.putImageData(outData, 0, 0);
  const diffPercent = (changedPixels / totalPixels) * 100;
  return { diffDataUrl: out.toDataURL("image/jpeg", 0.85), diffPercent };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
