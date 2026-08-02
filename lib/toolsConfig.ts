export type ToolCategory =
  | "AI"
  | "Organize"
  | "Optimize"
  | "Convert"
  | "Edit"
  | "Security";

export type ToolStatus = "live" | "soon";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  accent: "amber" | "teal" | "rust" | "violet";
  /** why it's not live yet, shown on the "soon" badge tooltip */
  soonReason?: string;
}

export const TOOLS: ToolMeta[] = [
  // AI
  { slug: "summarize", name: "Summarize PDF", description: "Get a concise summary of a long document.", category: "AI", status: "live", accent: "violet" },
  { slug: "ask", name: "Ask your PDF", description: "Chat with a document and get sourced answers.", category: "AI", status: "live", accent: "violet" },
  { slug: "translate", name: "Translate PDF", description: "Translate a PDF's text into another language.", category: "AI", status: "live", accent: "violet" },
  { slug: "ai-html-to-pdf", name: "AI HTML to PDF", description: "Clean up messy HTML and convert it to a polished PDF.", category: "AI", status: "live", accent: "violet" },
  { slug: "ai-pdf-to-html", name: "AI PDF to HTML", description: "Turn a PDF into clean, structured HTML you can publish.", category: "AI", status: "live", accent: "violet" },
  { slug: "detect-plagiarism", name: "Detect Plagiarism", description: "AI writing analysis that flags passages that look unoriginal or copy-pasted.", category: "AI", status: "live", accent: "violet" },
  { slug: "remove-background", name: "Image Background Remover", description: "Erase a photo's background in your browser — no upload, no account.", category: "AI", status: "live", accent: "violet" },

  // Organize
  { slug: "merge", name: "Merge PDF", description: "Combine PDFs in the order you want.", category: "Organize", status: "live", accent: "teal" },
  { slug: "split", name: "Split PDF", description: "Break a PDF into separate files by page range.", category: "Organize", status: "live", accent: "teal" },
  { slug: "remove-pages", name: "Remove pages", description: "Delete specific pages from a PDF.", category: "Organize", status: "live", accent: "teal" },
  { slug: "extract-pages", name: "Extract pages", description: "Pull selected pages into a new PDF.", category: "Organize", status: "live", accent: "teal" },
  { slug: "organize", name: "Organize PDF", description: "Reorder, rotate, or delete pages visually.", category: "Organize", status: "live", accent: "teal" },
  { slug: "compare", name: "Compare PDFs", description: "See exactly what changed between two versions.", category: "Organize", status: "live", accent: "teal" },

  // Optimize
  { slug: "compress", name: "Compress PDF", description: "Shrink file size by re-encoding page images.", category: "Optimize", status: "live", accent: "amber" },
  { slug: "repair", name: "Repair PDF", description: "Attempt to rebuild a damaged PDF.", category: "Optimize", status: "live", accent: "amber" },
  { slug: "ocr", name: "OCR PDF", description: "Make scanned PDFs searchable and selectable.", category: "Optimize", status: "live", accent: "amber" },

  // Convert
  { slug: "jpg-to-pdf", name: "JPG to PDF", description: "Turn images into a PDF in seconds.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", description: "Export each page as a JPG image.", category: "Convert", status: "live", accent: "amber" },
  { slug: "scan-to-pdf", name: "Scan to PDF", description: "Scan documents from your phone straight into a PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-pdfa", name: "PDF to PDF/A", description: "Convert a PDF to the PDF/A archival format.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-markdown", name: "PDF to Markdown", description: "Turn a PDF into clean Markdown — headings, tables, and links intact.", category: "Convert", status: "live", accent: "amber" },
  { slug: "word-to-pdf", name: "Word to PDF", description: "Convert .docx files to PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-word", name: "PDF to Word", description: "Export PDF text into an editable .docx.", category: "Convert", status: "live", accent: "amber" },
  { slug: "excel-to-pdf", name: "Excel to PDF", description: "Convert spreadsheets to PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-excel", name: "PDF to Excel", description: "Pull tables out of a PDF into .xlsx.", category: "Convert", status: "live", accent: "amber" },
  { slug: "powerpoint-to-pdf", name: "PowerPoint to PDF", description: "Extract a .pptx file's text into a PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-powerpoint", name: "PDF to PowerPoint", description: "Turn each PDF page into a slide image.", category: "Convert", status: "live", accent: "amber" },
  { slug: "html-to-pdf", name: "HTML to PDF", description: "Convert an HTML file or snippet to PDF.", category: "Convert", status: "live", accent: "amber" },

  // Edit
  { slug: "watermark", name: "Watermark", description: "Stamp text over every page.", category: "Edit", status: "live", accent: "rust" },
  { slug: "page-numbers", name: "Page numbers", description: "Add page numbers with your choice of position.", category: "Edit", status: "live", accent: "rust" },
  { slug: "rotate", name: "Rotate PDF", description: "Rotate one page or the whole document.", category: "Edit", status: "live", accent: "rust" },
  { slug: "crop", name: "Crop PDF", description: "Trim margins from every page.", category: "Edit", status: "live", accent: "rust" },

  // Security
  { slug: "sign", name: "Sign PDF", description: "Draw or type a signature and place it on the page.", category: "Security", status: "live", accent: "rust" },
  { slug: "redact", name: "Redact PDF", description: "Black out and permanently flatten sensitive areas.", category: "Security", status: "live", accent: "rust" },
  { slug: "protect", name: "Protect PDF", description: "Add a password to a PDF, encrypted with AES-256.", category: "Security", status: "live", accent: "rust" },
  { slug: "unlock", name: "Unlock PDF", description: "Remove a known password from a PDF.", category: "Security", status: "live", accent: "rust" },
];

export const CATEGORIES: ToolCategory[] = ["AI", "Organize", "Optimize", "Convert", "Edit", "Security"];

export const CATEGORY_TKEY: Record<ToolCategory, "catAI" | "catOrganize" | "catOptimize" | "catConvert" | "catEdit" | "catSecurity"> = {
  AI: "catAI",
  Organize: "catOrganize",
  Optimize: "catOptimize",
  Convert: "catConvert",
  Edit: "catEdit",
  Security: "catSecurity",
};

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
