"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { renderPdfPages, getPdfPageCount } from "@/lib/pdfRender";
import { useLanguage } from "./LanguageProvider";

const MAX_THUMBS = 8;
const THUMB_SCALE = 0.28;

/**
 * A quick, glanceable look at a tool's result before committing to the
 * download — a small strip of page thumbnails plus a link that opens the
 * complete file in a new tab using the browser's own PDF viewer (real,
 * full-fidelity review, without building a custom in-app one). Renders
 * nothing if the PDF can't be read for any reason — a broken preview
 * should never block the actual download.
 */
export default function PdfResultPreview({ bytes }: { bytes: Uint8Array }) {
  const { t } = useLanguage();
  const [thumbs, setThumbs] = useState<string[] | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Real page count first — requesting a thumbnail index past the end
    // of the document throws (pdf.js has no page 6 of a 3-page result),
    // which would otherwise silently kill the whole preview via the
    // catch below for the common case of a short result.
    getPdfPageCount(bytes.slice().buffer)
      .then((total) => {
        if (cancelled) return;
        const count = Math.min(MAX_THUMBS, total);
        setPageCount(total <= MAX_THUMBS ? total : null); // exact count only if every page is shown
        return renderPdfPages(bytes.slice().buffer, THUMB_SCALE, Array.from({ length: count }, (_, i) => i));
      })
      .then((pages) => {
        if (cancelled || !pages) return;
        setThumbs(pages.map((p) => p.dataUrl));
      })
      .catch(() => {
        // Best-effort — a preview that fails to render just doesn't show up.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes]);

  function viewFull() {
    const blob = new Blob([bytes.slice()], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // The new tab has its own reference; release ours after it's had time to load.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  if (!thumbs || thumbs.length === 0) return null;

  const truncated = pageCount === null;

  return (
    <div className="mt-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {thumbs.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Page ${i + 1}`}
            className="h-24 w-auto shrink-0 rounded border border-paper-line bg-white shadow-sm"
          />
        ))}
        {truncated && (
          <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded border border-dashed border-paper-line text-xs text-ink-faint">
            +more
          </div>
        )}
      </div>
      <button
        onClick={viewFull}
        className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-amber-dark hover:text-amber transition-colors"
      >
        {t("viewFullResult")} <ExternalLink size={13} />
      </button>
    </div>
  );
}
