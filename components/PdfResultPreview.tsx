"use client";

import PdfThumbStrip from "./PdfThumbStrip";

/**
 * A quick, glanceable look at a tool's result before committing to the
 * download — thin wrapper around the shared PdfThumbStrip (also used by
 * FilePreview for the "what did I just upload" side of the same flow).
 */
export default function PdfResultPreview({ bytes }: { bytes: Uint8Array }) {
  return <PdfThumbStrip source={bytes} />;
}
