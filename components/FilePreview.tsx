"use client";

import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { formatBytes } from "@/lib/download";

interface FilePreviewProps {
  file: File;
  className?: string;
}

/**
 * Shows what was actually uploaded before someone commits to running a
 * tool on it — a PDF thumbnail (first page) with its page count for
 * PDFs, an image thumbnail for images, and a generic file icon for
 * everything else (docx/xlsx/pptx have no cheap in-browser preview).
 * Used by every tool's "file selected" state in place of a bare filename.
 */
export default function FilePreview({ file, className }: FilePreviewProps) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setThumb(null);
    setPageCount(null);

    if (file.type === "application/pdf") {
      (async () => {
        try {
          const { renderPdfPages, getPdfPageCount } = await import("@/lib/pdfRender");
          const [count, pages] = await Promise.all([getPdfPageCount(file), renderPdfPages(file, 0.35, [0])]);
          if (!cancelled) {
            setPageCount(count);
            setThumb(pages[0]?.dataUrl ?? null);
          }
        } catch {
          // preview is a nice-to-have; silently fall back to the generic icon
        }
      })();
    } else if (file.type.startsWith("image/")) {
      objectUrl = URL.createObjectURL(file);
      setThumb(objectUrl);
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const Icon = file.type === "application/pdf" ? FileText : file.type.startsWith("image/") ? ImageIcon : FileIcon;

  return (
    <div className={`flex items-center gap-3 rounded-md border border-paper-line bg-paper-dim/40 p-3 ${className ?? ""}`}>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="h-16 w-12 shrink-0 rounded-sm border border-paper-line bg-white object-cover" />
      ) : (
        <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded-sm border border-paper-line bg-white text-ink-faint">
          <Icon size={20} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{file.name}</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {formatBytes(file.size)}
          {pageCount ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
        </p>
      </div>
    </div>
  );
}
