"use client";

import { useEffect, useState } from "react";
import { renderPdfPages, RenderedPage } from "./pdfRender";

export function usePdfThumbnails(file: File | null, scale = 0.32) {
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    renderPdfPages(file, scale)
      .then((res) => {
        if (!cancelled) setPages(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Couldn't read this PDF.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, scale]);

  return { pages, loading, error };
}
