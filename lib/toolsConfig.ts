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
  accent: "amber" | "teal" | "rust" | "violet" | "green" | "orange";
  /** why it's not live yet, shown on the "soon" badge tooltip */
  soonReason?: string;
}

export const TOOLS: ToolMeta[] = [
  // AI
  { slug: "summarize", name: "Summarize PDF", description: "Get a concise summary of a long document.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },
  { slug: "ask", name: "Ask your PDF", description: "Chat with a document and get sourced answers.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },
  { slug: "translate", name: "Translate PDF", description: "Translate a PDF's text into another language.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },
  { slug: "ai-html-to-pdf", name: "AI HTML to PDF", description: "Clean up messy HTML and convert it to a polished PDF.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },
  { slug: "ai-pdf-to-html", name: "AI PDF to HTML", description: "Turn a PDF into clean, structured HTML you can publish.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },
  { slug: "detect-plagiarism", name: "Detect Plagiarism", description: "AI writing analysis that flags passages that look unoriginal or copy-pasted.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },
  { slug: "remove-background", name: "Image Background Remover", description: "Erase a photo's background in your browser — no upload, no account.", category: "AI", status: "soon", accent: "violet", soonReason: "AI tools are coming soon" },

  // Organize
  { slug: "merge", name: "Merge PDF", description: "Combine PDFs in the order you want.", category: "Organize", status: "live", accent: "teal" },
  { slug: "split", name: "Split PDF", description: "Break a PDF into separate files by page range, or into equal chunks.", category: "Organize", status: "live", accent: "teal" },
  { slug: "remove-pages", name: "Remove pages", description: "Delete specific pages from a PDF.", category: "Organize", status: "live", accent: "teal" },
  { slug: "extract-pages", name: "Extract pages", description: "Pull selected pages into a new PDF.", category: "Organize", status: "live", accent: "teal" },
  { slug: "organize", name: "Organize PDF", description: "Reorder, rotate, or delete pages visually.", category: "Organize", status: "live", accent: "teal" },
  { slug: "compare", name: "Compare PDFs", description: "See exactly what changed between two versions.", category: "Organize", status: "live", accent: "teal" },
  { slug: "extract-images", name: "Extract Images from PDF", description: "Pull the embedded photos and logos out of a PDF as a zip of image files.", category: "Organize", status: "live", accent: "teal" },
  { slug: "batch", name: "Batch Process PDFs", description: "Compress, watermark, protect, or unlock many PDFs at once, delivered together in a zip.", category: "Organize", status: "live", accent: "teal" },

  // Optimize
  { slug: "compress", name: "Compress PDF", description: "Shrink file size by re-encoding page images.", category: "Optimize", status: "live", accent: "green" },
  { slug: "compress-to-size", name: "Compress to Target Size", description: "Shrink a PDF down until it fits under a size you choose — for email or upload limits.", category: "Optimize", status: "live", accent: "green" },
  { slug: "repair", name: "Repair PDF", description: "Attempt to rebuild a damaged PDF.", category: "Optimize", status: "live", accent: "green" },
  { slug: "ocr", name: "OCR PDF", description: "Make scanned PDFs searchable and selectable.", category: "Optimize", status: "live", accent: "green" },
  { slug: "accessibility-checker", name: "Accessibility Checker", description: "Scan a PDF for the concrete things that block screen readers — missing tags, no language, no title, and more.", category: "Optimize", status: "live", accent: "green" },

  // Convert
  { slug: "jpg-to-pdf", name: "JPG to PDF", description: "Turn images into a PDF in seconds.", category: "Convert", status: "live", accent: "amber" },
  { slug: "heic-to-pdf", name: "HEIC to PDF", description: "Turn iPhone HEIC/HEIF photos into a PDF, converted right in your browser.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", description: "Export each page as a JPG image.", category: "Convert", status: "live", accent: "amber" },
  { slug: "scan-to-pdf", name: "Scan to PDF", description: "Scan documents from your phone straight into a PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-pdfa", name: "PDF to PDF/A", description: "Convert a PDF to the PDF/A archival format.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-markdown", name: "PDF to Markdown", description: "Turn a PDF into clean Markdown — headings, tables, and links intact.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-text", name: "PDF to Text", description: "Pull the plain, copyable text out of a PDF and save it as a .txt file.", category: "Convert", status: "live", accent: "amber" },
  { slug: "word-to-pdf", name: "Word to PDF", description: "Convert .docx files to PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-word", name: "PDF to Word", description: "Export PDF text into an editable .docx.", category: "Convert", status: "live", accent: "amber" },
  { slug: "excel-to-pdf", name: "Excel to PDF", description: "Convert spreadsheets to PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-excel", name: "PDF to Excel", description: "Pull tables out of a PDF into .xlsx.", category: "Convert", status: "live", accent: "amber" },
  { slug: "powerpoint-to-pdf", name: "PowerPoint to PDF", description: "Extract a .pptx file's text into a PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "pdf-to-powerpoint", name: "PDF to PowerPoint", description: "Turn each PDF page into a slide image.", category: "Convert", status: "live", accent: "amber" },
  { slug: "html-to-pdf", name: "HTML to PDF", description: "Convert an HTML file or snippet to PDF.", category: "Convert", status: "live", accent: "amber" },
  { slug: "bank-statement-to-excel", name: "Bank Statement to Excel", description: "Turn a bank statement PDF into a clean spreadsheet with date, description, debit, credit, and balance columns.", category: "Convert", status: "live", accent: "amber" },

  // Edit
  { slug: "watermark", name: "Watermark", description: "Stamp text over every page.", category: "Edit", status: "live", accent: "orange" },
  { slug: "page-numbers", name: "Page numbers", description: "Add page numbers with your choice of position.", category: "Edit", status: "live", accent: "orange" },
  { slug: "rotate", name: "Rotate PDF", description: "Rotate one page or the whole document.", category: "Edit", status: "live", accent: "orange" },
  { slug: "crop", name: "Crop PDF", description: "Trim margins from every page.", category: "Edit", status: "live", accent: "orange" },
  { slug: "add-image", name: "Add Image to PDF", description: "Place a photo or logo onto a page — drag it into position, resize it, and it's fit to the page automatically.", category: "Edit", status: "live", accent: "orange" },
  { slug: "image-watermark", name: "Image Watermark", description: "Stamp a logo or image across every page, with adjustable opacity and size.", category: "Edit", status: "live", accent: "orange" },
  { slug: "add-qrcode", name: "Add QR Code to PDF", description: "Generate a QR code from a link or text and place it on a page.", category: "Edit", status: "live", accent: "orange" },
  { slug: "add-text", name: "Add Text to PDF", description: "Type free-form text directly onto a page — for filling in a blank on a scanned form or adding a note.", category: "Edit", status: "live", accent: "orange" },
  { slug: "fill-form", name: "Fill PDF Form", description: "Fill out a fillable PDF's own form fields — text, checkboxes, and dropdowns — and download it.", category: "Edit", status: "live", accent: "orange" },
  { slug: "highlight-pdf", name: "Highlight & Annotate PDF", description: "Highlight text and add sticky-note comments directly on a page.", category: "Edit", status: "live", accent: "orange" },
  { slug: "id-photo", name: "ID Photo Maker", description: "Crop and resize a photo to a standard passport or ID size with a solid background.", category: "Edit", status: "live", accent: "orange" },
  { slug: "edit-metadata", name: "Edit PDF Metadata", description: "Set a PDF's title, author, subject, and keywords.", category: "Edit", status: "live", accent: "orange" },
  { slug: "flatten-pdf", name: "Flatten PDF", description: "Bake a filled-out form's values into the page permanently, so it can no longer be edited.", category: "Edit", status: "live", accent: "orange" },
  { slug: "resize-pdf", name: "Resize PDF Pages", description: "Rescale every page to a standard size like A4, Letter, Legal, or A3.", category: "Edit", status: "live", accent: "orange" },
  { slug: "read-aloud", name: "Read PDF Aloud", description: "Listen to a document read aloud using your browser's built-in voice, page by page.", category: "Edit", status: "live", accent: "orange" },

  // Security
  { slug: "sign", name: "Sign PDF", description: "Draw or type a signature and place it on the page.", category: "Security", status: "live", accent: "rust" },
  { slug: "redact", name: "Redact PDF", description: "Black out and permanently flatten sensitive areas.", category: "Security", status: "live", accent: "rust" },
  { slug: "protect", name: "Protect PDF", description: "Add a password to a PDF, encrypted with AES-256.", category: "Security", status: "live", accent: "rust" },
  { slug: "unlock", name: "Unlock PDF", description: "Remove a known password from a PDF.", category: "Security", status: "live", accent: "rust" },
];

export const CATEGORIES: ToolCategory[] = ["Organize", "Optimize", "Convert", "Edit", "Security", "AI"];

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

/** One-paragraph intro copy for each category's hub page (/category/[slug]) — distinct from any single tool's own description, for unique on-page content. */
export const CATEGORY_INTRO: Record<ToolCategory, string> = {
  Organize:
    "Reshape a document without touching what's on the page — merge several PDFs into one, split one into many, reorder pages, or pull specific pages out.",
  Optimize:
    "Fix a file rather than change its content — shrink a bloated PDF down to a target size, rebuild a damaged one, or make a scanned document searchable.",
  Convert:
    "Move content between PDF and the format you actually need it in — Word, Excel, PowerPoint, images, Markdown, and more, in both directions.",
  Edit:
    "Make small changes directly on the page — stamp a watermark or page numbers, annotate, fill in a form, add a photo or QR code, or resize the whole document.",
  Security:
    "Control who can open, read, or edit a PDF — add or remove a password, sign it, or permanently black out sensitive text.",
  AI: "AI-assisted reading and writing for PDFs — summarizing a long document, chatting with it, and translating it into another language.",
};
