"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { renderPdfPages, getPdfPageCount } from "@/lib/pdfRender";
import { useLanguage } from "./LanguageProvider";

const MAX_THUMBS = 8;
const THUMB_SCALE = 0.28;

interface PdfThumbStripProps {
  /** A File (the just-uploaded original) or raw PDF bytes (a tool's result) — both render the same way. */
  source: File | Uint8Array;
  /** Label for the "view full" link — defaults to the shared translation, but callers can be specific ("View original" vs "View full result"). */
  label?: string;
}

/**
 * A page-thumbnail strip plus a "view full" link that opens the complete
 * PDF in a new tab via the browser's own viewer — shared by FilePreview
 * (what did I just upload, before running anything) and PdfResultPreview
 * (what did this tool produce, before downloading it), so both sides of
 * a tool's flow give the same kind of real, glanceable visual confirmation
 * instead of just a filename. Renders nothing if the PDF can't be read —
 * a broken preview should never block the actual tool.
 */
export default function PdfThumbStrip({ source, label }: PdfThumbStripProps) {
  const { t } = useLanguage();
  const [thumbs, setThumbs] = useState<string[] | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const input = source instanceof File ? source : source.slice().buffer;

    getPdfPageCount(input)
      .then((total) => {
        if (cancelled) return;
        const count = Math.min(MAX_THUMBS, total);
        setTruncated(total > MAX_THUMBS);
        return renderPdfPages(input, THUMB_SCALE, Array.from({ length: count }, (_, i) => i));
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
  }, [source]);

  function viewFull() {
    const blob = source instanceof File ? source : new Blob([source.slice()], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  if (!thumbs || thumbs.length === 0) return null;

  return (
    <div className="mt-3">
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
        {label ?? t("viewFullResult")} <ExternalLink size={13} />
      </button>
    </div>
  );
}
