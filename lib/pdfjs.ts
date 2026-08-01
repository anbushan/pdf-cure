"use client";

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

/**
 * Lazily loads pdf.js on first use and configures its worker to be
 * bundled locally (not fetched from a CDN) so it: (a) works offline
 * once the PWA has cached it, and (b) doesn't block the initial page
 * load of every tool page with ~1MB of JS nobody needed yet.
 */
export function getPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.js",
        import.meta.url
      ).toString();
      return lib;
    });
  }
  return pdfjsPromise;
}
