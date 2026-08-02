/**
 * Search-term targeting pulled from a competitor keyword-volume export
 * (iLovePDF's top organic queries). Two things live here:
 *
 * 1. TOOL_KEYWORDS — feeds each tool page's <meta name="keywords">. Google
 *    and Bing have both ignored this tag for ranking purposes since ~2009;
 *    it's included for parity with sites that still read it and costs
 *    nothing to add.
 * 2. TOOL_SEO_OVERRIDES — real ranking signal. Custom <title>/description
 *    text for the highest-volume tools, phrased with the synonyms people
 *    actually search (“pdf merger”, “convert word to pdf”, “pdf splitter”)
 *    instead of just our own internal tool name.
 *
 * Only English is targeted here — canonical URLs aren't locale-specific
 * (the UI's language switcher doesn't change the URL), so per-locale
 * keyword targeting isn't applicable the way it is for ilovepdf.com/es/…
 */

export const TOOL_KEYWORDS: Record<string, string[]> = {
  merge: ["merge pdf", "pdf merge", "pdf merger", "combine pdf", "pdf combiner", "join pdf", "merge pdf files"],
  split: ["split pdf", "pdf splitter", "pdf split", "separate pdf", "divide pdf"],
  compress: ["compress pdf", "pdf compressor", "pdf size reducer", "reduce pdf size", "shrink pdf", "pdf resize"],
  repair: ["repair pdf", "fix corrupted pdf", "rebuild pdf"],
  ocr: ["ocr pdf", "make pdf searchable", "scanned pdf to text"],
  "remove-pages": ["remove pages from pdf", "pdf page remover", "delete pdf pages"],
  "extract-pages": ["extract pdf pages", "pull pages from pdf"],
  organize: ["organize pdf", "reorder pdf pages", "rearrange pdf"],
  compare: ["compare pdf", "pdf diff", "compare two pdfs"],
  "jpg-to-pdf": ["jpg to pdf", "image to pdf", "jpeg to pdf", "png to pdf", "photo to pdf", "img to pdf", "jpg to pdf converter"],
  "pdf-to-jpg": ["pdf to jpg", "pdf to image", "pdf to jpg converter", "pdf to png", "pdf to jpeg", "convert pdf to jpg"],
  "word-to-pdf": ["word to pdf", "word to pdf converter", "convert word to pdf", "doc to pdf", "docx to pdf"],
  "pdf-to-word": ["pdf to word", "pdf to word converter", "convert pdf to word", "pdf to doc", "pdf to docx"],
  "excel-to-pdf": ["excel to pdf", "convert excel to pdf", "xlsx to pdf"],
  "pdf-to-excel": ["pdf to excel", "pdf to excel converter", "convert pdf to excel"],
  "powerpoint-to-pdf": ["ppt to pdf", "pptx to pdf", "powerpoint to pdf", "convert powerpoint to pdf"],
  "pdf-to-powerpoint": ["pdf to ppt", "pdf to powerpoint", "convert pdf to powerpoint"],
  "html-to-pdf": ["html to pdf", "convert html to pdf", "webpage to pdf"],
  "scan-to-pdf": ["scan to pdf", "scan document to pdf", "phone scanner pdf"],
  "pdf-to-pdfa": ["pdf to pdf/a", "pdf/a converter", "archive pdf"],
  "pdf-to-markdown": ["pdf to markdown", "pdf to md"],
  watermark: ["watermark pdf", "add watermark to pdf"],
  "page-numbers": ["add page numbers to pdf", "pdf page numbers"],
  rotate: ["rotate pdf", "rotate pdf pages"],
  crop: ["crop pdf", "trim pdf margins"],
  sign: ["sign pdf", "pdf signature", "esign pdf"],
  protect: ["password protect pdf", "encrypt pdf", "add password to pdf"],
  unlock: ["unlock pdf", "remove password from pdf", "pdf password remover", "decrypt pdf"],
  redact: ["redact pdf", "black out pdf text", "remove sensitive info from pdf"],
  summarize: ["summarize pdf", "pdf summary ai"],
  ask: ["chat with pdf", "ask pdf questions", "pdf chatbot"],
  translate: ["translate pdf", "pdf translator"],
  "ai-html-to-pdf": ["ai html to pdf"],
  "ai-pdf-to-html": ["ai pdf to html"],
};

export interface ToolSeoOverride {
  title: string;
  description: string;
}

/** Custom title/description for the tools with meaningful search-term overlap with the competitor data above. */
export const TOOL_SEO_OVERRIDES: Record<string, ToolSeoOverride> = {
  merge: {
    title: "Merge PDF Files Free — Combine & Join PDFs Online | PDFCure",
    description:
      "Merge, combine, or join multiple PDF files into one — free, private, and done entirely in your browser. No upload, no sign-up, no watermark.",
  },
  split: {
    title: "Split PDF Free — PDF Splitter Online | PDFCure",
    description:
      "Split a PDF into separate files by page range, right in your browser. Free PDF splitter with no upload and no file size limit.",
  },
  compress: {
    title: "Compress PDF Free — Reduce PDF File Size Online | PDFCure",
    description:
      "Shrink a PDF's file size in your browser — a free PDF compressor and size reducer with no upload, no watermark, and no account.",
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Free — Convert PDF to DOC/DOCX | PDFCure",
    description:
      "Convert PDF to Word (.docx) for free, entirely in your browser. A fast PDF to Word converter with no upload and no sign-up.",
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free — Convert DOC/DOCX to PDF | PDFCure",
    description:
      "Convert Word (.docx) to PDF for free, entirely in your browser. A fast Word to PDF converter with no upload and no sign-up.",
  },
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Free — Image to PDF Online | PDFCure",
    description:
      "Turn JPG, PNG, or any image into a PDF for free, right in your browser. A fast image-to-PDF converter with no upload and no watermark.",
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter Free — Convert PDF to Image | PDFCure",
    description:
      "Export every PDF page as a JPG image for free, entirely in your browser. A fast PDF to JPG converter with no upload and no sign-up.",
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free — Convert XLSX to PDF | PDFCure",
    description: "Convert Excel spreadsheets to PDF for free, entirely in your browser. No upload, no sign-up, no watermark.",
  },
  "pdf-to-excel": {
    title: "PDF to Excel Converter Free — Convert PDF to XLSX | PDFCure",
    description: "Pull tables out of a PDF into an editable Excel spreadsheet for free, entirely in your browser.",
  },
  "powerpoint-to-pdf": {
    title: "PowerPoint to PDF Converter Free — Convert PPT/PPTX to PDF | PDFCure",
    description: "Convert PowerPoint (.pptx) to PDF for free, entirely in your browser. No upload, no sign-up.",
  },
  "pdf-to-powerpoint": {
    title: "PDF to PowerPoint Converter Free — Convert PDF to PPT | PDFCure",
    description: "Turn each PDF page into a PowerPoint slide for free, entirely in your browser.",
  },
  unlock: {
    title: "Unlock PDF Free — Remove PDF Password Online | PDFCure",
    description:
      "Remove a known password from a PDF for free, entirely in your browser. A private PDF password remover with no upload.",
  },
  "remove-pages": {
    title: "Remove Pages from PDF Free — PDF Page Remover | PDFCure",
    description: "Delete specific pages from a PDF for free, entirely in your browser. No upload, no sign-up.",
  },
  crop: {
    title: "Crop PDF Free — Trim PDF Margins Online | PDFCure",
    description: "Trim margins from every page of a PDF for free, entirely in your browser.",
  },
  "html-to-pdf": {
    title: "HTML to PDF Converter Free — Convert Webpage to PDF | PDFCure",
    description: "Convert an HTML file or snippet to PDF for free, entirely in your browser.",
  },
};
