"use client";

import { getPdfjs } from "./pdfjs";

export interface ExtractedText {
  text: string;
  pageCount: number;
  truncated: boolean;
}

/**
 * Pulls plain text out of a PDF using pdf.js, entirely client-side.
 * The text is what later gets sent to the server for the AI tools —
 * everything up to that point (reading the file, rendering, extracting)
 * still happens locally.
 */
export async function extractPdfText(file: File, maxChars = 120000): Promise<ExtractedText> {
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .join(" ");
    text += `\n\n--- Page ${i} ---\n${pageText}`;
    if (text.length > maxChars) break;
  }

  const truncated = text.length > maxChars;
  return { text: text.slice(0, maxChars), pageCount: pdf.numPages, truncated };
}
