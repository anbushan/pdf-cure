import { TOOLS, type ToolMeta } from "./toolsConfig";

/** Tools whose input isn't a plain PDF (or that don't take a dropped file at all) — excluded when a PDF is dropped. */
const NON_PDF_INPUT_SLUGS = new Set([
  "jpg-to-pdf",
  "word-to-pdf",
  "excel-to-pdf",
  "powerpoint-to-pdf",
  "html-to-pdf",
  "ai-html-to-pdf",
  "scan-to-pdf",
]);

const IMAGE_TOOL_SLUGS = ["jpg-to-pdf"];
const DOCX_TOOL_SLUGS = ["word-to-pdf"];
const SPREADSHEET_TOOL_SLUGS = ["excel-to-pdf"];
const PRESENTATION_TOOL_SLUGS = ["powerpoint-to-pdf"];
const HTML_TOOL_SLUGS = ["html-to-pdf", "ai-html-to-pdf"];

function bySlug(slugs: string[]): ToolMeta[] {
  return slugs.map((slug) => TOOLS.find((t) => t.slug === slug && t.status === "live")).filter((t): t is ToolMeta => !!t);
}

/**
 * Suggests which live tools make sense for a dropped file, so the
 * homepage quick-access modal doesn't just list every tool regardless of
 * whether it'd actually accept the file. PDFs match almost everything
 * (this is a PDF toolkit), so that direction is an exclude-list; every
 * other format has few enough matching tools that an include-list is
 * clearer.
 */
export function suggestToolsForFile(file: File): ToolMeta[] {
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";

  if (file.type === "application/pdf" || ext === ".pdf") {
    return TOOLS.filter((t) => t.status === "live" && !NON_PDF_INPUT_SLUGS.has(t.slug));
  }
  if (file.type.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
    return bySlug(IMAGE_TOOL_SLUGS);
  }
  if (ext === ".docx") {
    return bySlug(DOCX_TOOL_SLUGS);
  }
  if ([".xlsx", ".xls", ".csv"].includes(ext)) {
    return bySlug(SPREADSHEET_TOOL_SLUGS);
  }
  if (ext === ".pptx") {
    return bySlug(PRESENTATION_TOOL_SLUGS);
  }
  if ([".html", ".htm"].includes(ext)) {
    return bySlug(HTML_TOOL_SLUGS);
  }
  return [];
}
