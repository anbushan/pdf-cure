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
  "extract-images": ["extract images from pdf", "pdf to images", "save pdf images"],
  batch: ["batch pdf processing", "bulk pdf compress", "process multiple pdfs"],
  "compress-to-size": ["compress pdf to target size", "reduce pdf to specific size", "pdf under 1mb"],
  "jpg-to-pdf": ["jpg to pdf", "image to pdf", "jpeg to pdf", "png to pdf", "photo to pdf", "img to pdf", "jpg to pdf converter"],
  "heic-to-pdf": ["heic to pdf", "heif to pdf", "iphone photos to pdf", "heic to pdf converter"],
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
  "pdf-to-text": ["pdf to text", "pdf to txt", "extract text from pdf", "convert pdf to text"],
  "bank-statement-to-excel": ["bank statement to excel", "bank statement converter", "pdf statement to csv"],
  "flatten-pdf": ["flatten pdf", "flatten pdf form", "make pdf form uneditable"],
  "resize-pdf": ["resize pdf", "change pdf page size", "pdf page size converter", "a4 to letter pdf"],
  "read-aloud": ["read pdf aloud", "pdf text to speech", "listen to pdf", "pdf reader aloud"],
  watermark: ["watermark pdf", "add watermark to pdf"],
  "page-numbers": ["add page numbers to pdf", "pdf page numbers"],
  rotate: ["rotate pdf", "rotate pdf pages"],
  crop: ["crop pdf", "trim pdf margins"],
  "add-image": ["add image to pdf", "insert photo into pdf", "add logo to pdf"],
  "image-watermark": ["image watermark pdf", "add logo watermark pdf"],
  "add-qrcode": ["add qr code to pdf", "generate qr code pdf", "pdf qr code"],
  "add-text": ["add text to pdf", "type on pdf", "insert text into pdf"],
  "fill-form": ["fill pdf form", "pdf form filler", "complete pdf form online"],
  "highlight-pdf": ["highlight pdf", "annotate pdf", "pdf comment tool"],
  "id-photo": ["id photo maker", "passport photo online", "visa photo size"],
  "edit-metadata": ["edit pdf metadata", "change pdf author title", "pdf properties editor"],
  sign: ["sign pdf", "pdf signature", "esign pdf"],
  protect: ["password protect pdf", "encrypt pdf", "add password to pdf"],
  unlock: ["unlock pdf", "remove password from pdf", "pdf password remover", "decrypt pdf"],
  redact: ["redact pdf", "black out pdf text", "remove sensitive info from pdf"],
  summarize: ["summarize pdf", "pdf summary ai"],
  ask: ["chat with pdf", "ask pdf questions", "pdf chatbot"],
  translate: ["translate pdf", "pdf translator"],
  "ai-html-to-pdf": ["ai html to pdf"],
  "ai-pdf-to-html": ["ai pdf to html"],
  "detect-plagiarism": ["detect plagiarism", "ai content detector", "plagiarism checker"],
  "remove-background": ["remove background from image", "background remover", "transparent background image"],
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
  "extract-pages": {
    title: "Extract Pages from PDF Free — PDF Page Extractor | PDFCure",
    description: "Pull specific pages out of a PDF into a brand-new file, for free, entirely in your browser. No upload, no sign-up.",
  },
  organize: {
    title: "Organize PDF Free — Reorder & Rearrange PDF Pages | PDFCure",
    description: "Drag to reorder, rotate, or delete pages visually — free, entirely in your browser, with no upload and no sign-up.",
  },
  compare: {
    title: "Compare PDF Free — See Differences Between Two PDFs | PDFCure",
    description: "Spot exactly what changed between two versions of a PDF, for free, entirely in your browser. No upload required.",
  },
  "extract-images": {
    title: "Extract Images from PDF Free — Save Photos as JPG/PNG | PDFCure",
    description: "Pull every embedded photo and logo out of a PDF into a zip of image files, for free, entirely in your browser.",
  },
  batch: {
    title: "Batch Process PDFs Free — Compress, Watermark & More | PDFCure",
    description: "Compress, watermark, protect, or unlock many PDFs at once and download them together in a zip — free, no upload.",
  },
  "compress-to-size": {
    title: "Compress PDF to Target Size Free — Hit an Exact File Size | PDFCure",
    description: "Shrink a PDF down until it fits under the exact size you choose — for email or upload limits, free, no upload.",
  },
  repair: {
    title: "Repair PDF Free — Fix a Corrupted or Damaged PDF | PDFCure",
    description: "Attempt to rebuild a broken or corrupted PDF so it opens normally again — free, entirely in your browser.",
  },
  ocr: {
    title: "OCR PDF Free — Make a Scanned PDF Searchable | PDFCure",
    description: "Turn a scanned PDF's pages into searchable, selectable text for free, entirely in your browser. No upload needed.",
  },
  "heic-to-pdf": {
    title: "HEIC to PDF Converter Free — iPhone Photos to PDF | PDFCure",
    description: "Turn iPhone HEIC/HEIF photos into a PDF for free, converted right in your browser. No upload, no sign-up.",
  },
  "scan-to-pdf": {
    title: "Scan to PDF Free — Scan Documents from Your Phone | PDFCure",
    description: "Scan a document with your phone's camera straight into a PDF on your computer — free, no app to install.",
  },
  "pdf-to-pdfa": {
    title: "PDF to PDF/A Converter Free — Archival PDF Format | PDFCure",
    description: "Convert a PDF to the PDF/A archival format for long-term storage, free, entirely in your browser.",
  },
  "pdf-to-markdown": {
    title: "PDF to Markdown Converter Free — Clean MD Output | PDFCure",
    description: "Turn a PDF into clean Markdown with headings, tables, and links intact — free, entirely in your browser.",
  },
  "pdf-to-text": {
    title: "PDF to Text Converter Free — Extract Text from PDF | PDFCure",
    description: "Pull the plain, copyable text out of a PDF and save it as a .txt file — free, entirely in your browser.",
  },
  "bank-statement-to-excel": {
    title: "Bank Statement to Excel Free — PDF Statement Converter | PDFCure",
    description: "Turn a bank statement PDF into a clean spreadsheet with dates, amounts, and running balance — free, no upload.",
  },
  watermark: {
    title: "Add Watermark to PDF Free — Stamp Text on Every Page | PDFCure",
    description: "Stamp custom text across every page of a PDF for free, entirely in your browser. No upload, no sign-up.",
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free — Choose Position & Style | PDFCure",
    description: "Add page numbers to a PDF with your choice of position and starting number — free, entirely in your browser.",
  },
  rotate: {
    title: "Rotate PDF Free — Rotate Pages Online | PDFCure",
    description: "Rotate one page or an entire PDF document for free, entirely in your browser. No upload, no sign-up.",
  },
  "add-image": {
    title: "Add Image to PDF Free — Place a Photo or Logo on a Page | PDFCure",
    description: "Drag a photo or logo onto any page of a PDF, resize it, and it's placed automatically — free, no upload.",
  },
  "image-watermark": {
    title: "Image Watermark for PDF Free — Stamp a Logo on Every Page | PDFCure",
    description: "Stamp a logo or image across every page with adjustable opacity and size — free, entirely in your browser.",
  },
  "add-qrcode": {
    title: "Add QR Code to PDF Free — Generate & Place a QR Code | PDFCure",
    description: "Generate a QR code from a link or text and place it on any page of a PDF — free, entirely in your browser.",
  },
  "add-text": {
    title: "Add Text to PDF Free — Type Directly onto a PDF Page | PDFCure",
    description: "Type free-form text directly onto a PDF page — handy for filling a blank on a scanned form — free, no upload.",
  },
  "fill-form": {
    title: "Fill PDF Form Free — Complete Fillable PDF Forms Online | PDFCure",
    description: "Fill out a fillable PDF's own form fields — text, checkboxes, dropdowns — and download it, free, no upload.",
  },
  "highlight-pdf": {
    title: "Highlight & Annotate PDF Free — Add Comments to a PDF | PDFCure",
    description: "Highlight text and add sticky-note comments directly on a page, free, entirely in your browser.",
  },
  "id-photo": {
    title: "ID Photo Maker Free — Passport & Visa Photo Online | PDFCure",
    description: "Crop and resize a photo to a standard passport or ID size with a solid background — free, no upload.",
  },
  "edit-metadata": {
    title: "Edit PDF Metadata Free — Change Title, Author & Keywords | PDFCure",
    description: "Set a PDF's title, author, subject, and keywords for free, entirely in your browser. No upload, no sign-up.",
  },
  "flatten-pdf": {
    title: "Flatten PDF Free — Make a Filled Form Uneditable | PDFCure",
    description: "Bake a filled-out PDF form's values permanently into the page, free, entirely in your browser. No upload.",
  },
  "resize-pdf": {
    title: "Resize PDF Free — Change Page Size to A4, Letter & More | PDFCure",
    description: "Rescale every page of a PDF to a standard size like A4, Letter, Legal, or A3 — free, entirely in your browser.",
  },
  "read-aloud": {
    title: "Read PDF Aloud Free — Text-to-Speech PDF Reader | PDFCure",
    description: "Listen to a PDF read aloud page by page using your browser's built-in voice — free, no upload, no account.",
  },
  sign: {
    title: "Sign PDF Free — eSign a Document Online | PDFCure",
    description: "Draw or type a signature and place it on a PDF page for free, entirely in your browser. No upload, no account.",
  },
  redact: {
    title: "Redact PDF Free — Permanently Black Out Sensitive Text | PDFCure",
    description: "Black out and permanently flatten sensitive areas of a PDF, free, entirely in your browser. No upload.",
  },
  protect: {
    title: "Password Protect PDF Free — Encrypt with AES-256 | PDFCure",
    description: "Add a password to a PDF, encrypted with AES-256, for free, entirely in your browser. No upload, no sign-up.",
  },
};
