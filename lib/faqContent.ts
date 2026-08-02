import type { FaqItem } from "@/components/Faq";

export const SITE_FAQS: FaqItem[] = [
  {
    q: "Is PDFCure actually free?",
    a: "Yes. Every editing tool runs in your browser with no account, no watermark, and no page limit imposed by us. The AI tools (Summarize, Ask your PDF, Translate) require a free Google sign-in and are limited to one use per day per account.",
  },
  {
    q: "Do you upload my files to a server?",
    a: "For every tool except Summarize, Ask your PDF, and Translate, no — the file never leaves your device. Those three AI tools extract text in your browser and send that text (not the file itself) to a server to generate a response.",
  },
  {
    q: "Is there a file size limit?",
    a: "There's no artificial limit we impose, but since processing happens in your browser, very large files (500+ MB or 1,000+ pages) are limited by your device's memory rather than by us.",
  },
  {
    q: "Do I need to create an account?",
    a: "Only for the AI tools, which need a Google sign-in and allow one use per day per account. Every other tool works immediately with no sign-up.",
  },
  {
    q: "Does this work on mobile?",
    a: "Yes — the site is fully responsive, and it's installable as an app on both iOS and Android via 'Add to Home Screen.'",
  },
  {
    q: "Can I use this offline?",
    a: "Yes, once you've installed it (or just visited it once) — the non-AI tools keep working with no internet connection. The AI tools need a live connection and a signed-in Google account.",
  },
];

const TOOL_FAQS: Record<string, FaqItem[]> = {
  merge: [
    { q: "Can I change the order of the files before merging?", a: "Yes — after you add files, use the up/down arrows next to each one to reorder them before merging." },
    { q: "Is there a limit on how many PDFs I can merge?", a: "No hard limit — you can add as many files as your browser's memory can comfortably handle." },
    { q: "Is 'combine PDF' or 'join PDF' the same as merging?", a: "Yes — merge, combine, and join all mean the same thing here: putting multiple PDFs together into a single file in the order you choose." },
  ],
  split: [
    { q: "What format do I use for page ranges?", a: "Comma-separated groups like 1-3,5,7-9. Each group becomes its own PDF, delivered together in a single zip." },
    { q: "Can I split a PDF into individual single-page files?", a: "Yes — enter each page number separated by commas (e.g. 1,2,3,4) instead of ranges." },
  ],
  "remove-pages": [
    { q: "Can I remove non-consecutive pages?", a: "Yes — just tap each page thumbnail you want to delete; you're not limited to a single range." },
    { q: "Will this change the page numbers already printed on my document?", a: "No — this only removes pages from the file. Any page numbers drawn on the pages themselves stay as they were." },
  ],
  "extract-pages": [
    { q: "Does extracting pages remove them from the original?", a: "No — extraction creates a brand-new PDF containing copies of the pages you selected. Your original file is untouched." },
    { q: "Can I choose the order the extracted pages appear in?", a: "Extracted pages currently keep their original document order regardless of selection order." },
  ],
  organize: [
    { q: "Can I rotate individual pages instead of the whole document?", a: "Yes — the rotate button on each thumbnail only affects that one page, unlike the dedicated Rotate PDF tool which rotates everything." },
    { q: "What happens to deleted pages if I change my mind?", a: "Nothing is finalized until you click Save changes — you can keep adjusting the order, rotation, and deletions freely before then." },
  ],
  compare: [
    { q: "How is the difference percentage calculated?", a: "Each matching page pair is rendered as an image, and we count the percentage of pixels whose color differs beyond a small threshold — small enough to ignore anti-aliasing noise but sensitive to real content changes." },
    { q: "What if the two PDFs have a different number of pages?", a: "Pages that only exist in one document are flagged as 'Only in Document A' or 'Only in Document B' rather than compared against nothing." },
  ],
  compress: [
    { q: "Why did my file's text become blurry after compressing?", a: "Compression re-renders each page as an image and re-encodes it — it trades sharpness for file size, which is most noticeable on small text at the 'High' setting. Try 'Low' or 'Medium' first." },
    { q: "Will compression remove hyperlinks or form fields?", a: "Yes — because the page is flattened to an image, interactive elements like links and form fields won't survive compression." },
    { q: "Is this the same as a 'PDF size reducer'?", a: "Yes — compressing a PDF and reducing its file size are the same operation. This tool re-encodes the page images at your chosen quality level to shrink the total size." },
  ],
  repair: [
    { q: "What kinds of damage can this actually fix?", a: "It rebuilds the file's internal object table and cross-reference index from scratch, which resolves most 'can't open this file' or 'file is damaged' errors caused by a broken xref table or a corrupted incremental save. It can't fix a file that's simply not a PDF, or recover content that was never saved in the first place." },
    { q: "What happens if the file is too damaged to rebuild normally?", a: "It falls back to rendering each page it can still read as an image and assembles those into a new PDF. You get your content back visually, but the text is no longer selectable or searchable — that trade-off only kicks in when the normal rebuild fails outright." },
  ],
  ocr: [
    { q: "Will this change how the page looks?", a: "No — the original page image is kept exactly as-is. The recognized text is layered in invisibly underneath, so nothing changes visually, but you can now select, search, and copy the text." },
    { q: "How accurate is the text recognition?", a: "It depends heavily on scan quality and the language you select — clean, high-resolution scans in the correct language recognize very well, while skewed, low-resolution, or handwritten pages will have more errors. Make sure to pick the right document language before running it." },
    { q: "Does this upload my file anywhere?", a: "No — recognition runs entirely in your browser using a WebAssembly OCR engine. The only network activity is a one-time download of that engine and its language data, the same way this site's PDF viewer fetches its own rendering engine; your document itself never leaves your device." },
  ],
  watermark: [
    { q: "Can I add an image watermark instead of text?", a: "Not yet — this tool currently supports text watermarks only." },
    { q: "Will the watermark appear on every page?", a: "Yes, it's applied uniformly across the whole document." },
  ],
  "page-numbers": [
    { q: "Can I start numbering from something other than 1?", a: "Yes — set 'Start numbering at' to any number, useful if this document continues from another one." },
    { q: "Can I skip the first page (like a cover page)?", a: "Not directly in this version — numbers are applied to every page starting from the number you choose." },
  ],
  rotate: [
    { q: "Can I rotate just one page instead of the whole PDF?", a: "For a single page, use the Organize PDF tool instead — it lets you rotate individual thumbnails. This tool rotates every page at once." },
    { q: "Does rotating affect the file size?", a: "No — rotation just changes a page's orientation flag, so the file size stays essentially the same." },
  ],
  crop: [
    { q: "Can I crop each side by a different amount?", a: "Not currently — this tool trims an equal percentage margin from all four sides at once." },
    { q: "Does cropping delete the trimmed content permanently?", a: "It sets a new crop box, which is what PDF viewers and printers respect — but the original content technically remains in the file's data. For truly removing sensitive content, use Redact instead." },
  ],
  "jpg-to-pdf": [
    { q: "Can I mix JPG and PNG files in one PDF?", a: "Yes — you can add both formats and they'll all convert into a single PDF, one image per page." },
    { q: "Can I control the order of the pages?", a: "Pages follow the order you add the images in — remove and re-add an image to move it." },
    { q: "Does this work for photos, screenshots, or scanned pages too?", a: "Yes — any image file works the same way, whether it's a photo, a screenshot, or a scan; each one becomes its own page in the PDF." },
  ],
  "pdf-to-jpg": [
    { q: "What resolution are the exported images?", a: "Pages are rendered at 2x scale for a sharp result suitable for viewing or printing, then bundled into a single zip file." },
    { q: "Can I export just one page instead of the whole document?", a: "Not in this version — it currently exports every page. Use Extract pages first if you only need specific pages converted." },
  ],
  "html-to-pdf": [
    { q: "Can I convert a live website URL?", a: "Not directly — browsers block cross-site page reads for privacy reasons. Save the page as an .html file first, or paste its HTML source, then convert that." },
    { q: "Will external images and fonts in my HTML load correctly?", a: "Images referenced by public URL generally load fine; anything requiring authentication or loaded from `localhost` won't." },
  ],
  "word-to-pdf": [
    { q: "Does this work with the old .doc format?", a: "No — only the modern .docx format is supported." },
    { q: "Will complex formatting like columns or text boxes carry over exactly?", a: "Basic formatting, headings, and lists convert well; very complex layouts may shift slightly since conversion goes through HTML as an intermediate step." },
  ],
  "pdf-to-word": [
    { q: "Why is my exported .docx just plain text with no formatting?", a: "This tool extracts text only — layout, images, and tables aren't reconstructed. It's meant for quickly getting editable text out, not a pixel-perfect conversion." },
    { q: "Why did it produce an empty document?", a: "If the PDF is a scanned image with no selectable text layer, there's no text to extract. This tool doesn't perform OCR." },
    { q: "Does this produce a .doc or a .docx file?", a: "A .docx file — the modern Word format used by Word 2007 and later, and by Google Docs, LibreOffice, and Pages." },
  ],
  "excel-to-pdf": [
    { q: "Does this preserve cell formulas?", a: "No — cells convert to their currently displayed values, not their underlying formulas, since a PDF has no concept of formulas." },
    { q: "What if my spreadsheet has multiple sheets?", a: "Every sheet is included, each rendered as its own table with a heading, one after another in the PDF." },
  ],
  "pdf-to-excel": [
    { q: "How does this know what's a table versus regular paragraphs?", a: "It doesn't detect tables specifically — it groups text by its position on the page, turning aligned rows and columns into spreadsheet cells. Actual tables in the PDF convert well; regular paragraphs of text will come out as one long cell per line rather than being split into columns." },
    { q: "Why did it produce an empty or blank spreadsheet?", a: "If the PDF is a scanned image with no selectable text layer, there's no text to extract — run OCR PDF first to add a text layer, then convert." },
    { q: "How are multiple pages handled?", a: "Each page of the PDF becomes its own sheet in the output workbook, named 'Page 1', 'Page 2', and so on." },
  ],
  sign: [
    { q: "Is this a legally binding e-signature?", a: "This creates a visual signature image placed on the page — it's not a certified digital signature with identity verification. For contracts that require legal e-signature compliance, use a dedicated e-signature service." },
    { q: "Can I save my signature for reuse next time?", a: "Not currently — you'll draw your signature fresh each time you use the tool, and nothing is stored." },
  ],
  protect: [
    { q: "What encryption does this actually use?", a: "AES-256, the current PDF encryption standard — the same class of encryption Adobe Acrobat and other professional tools use, applied entirely in your browser via the Web Crypto API." },
    { q: "Can I recover the password if I forget it?", a: "No — there's no recovery mechanism, by design. That's what makes the encryption real. Keep the password somewhere safe; if it's lost, the file can't be opened by anyone, including you." },
  ],
  unlock: [
    { q: "Do I need to know the password to use this?", a: "Yes — this removes a password you already know, verified locally in your browser before anything happens. It doesn't crack, guess, or brute-force a password you don't have." },
    { q: "What happens if I enter the wrong password?", a: "You'll get a clear \"that password doesn't match\" message and can try again — nothing is sent anywhere in the process, so there's no lockout or attempt limit." },
    { q: "Is this the same as a 'PDF password remover'?", a: "Yes — unlocking and removing a password both mean the same thing: stripping the encryption from a PDF once you've verified you know its password." },
  ],
  "pdf-to-powerpoint": [
    { q: "Can I edit the text on the slides afterward?", a: "Not directly — each slide is a full-page image of the original PDF page, so text isn't a separate editable element the way it would be in a slide built from scratch in PowerPoint." },
    { q: "Will the slides look exactly like the PDF pages?", a: "Yes — since each slide is a rendered image of the page, the visual layout is identical to the source PDF." },
  ],
  "powerpoint-to-pdf": [
    { q: "Will my slide designs, images, and layouts carry over?", a: "No — this extracts the text content from each slide and lays it out as plain text on a PDF page. Backgrounds, shapes, images, fonts, and exact positioning don't transfer. For a visual copy of your deck, exporting to PDF directly from PowerPoint will always be more faithful." },
    { q: "Does this work with the older .ppt format?", a: "No — only the modern .pptx format (PowerPoint 2007 and later) is supported." },
  ],
  redact: [
    { q: "Is redacted content really removed, or just covered with a black box?", a: "Really removed. The page is rendered as a flattened image with the box burned in, so there's no text layer left underneath to copy or search." },
    { q: "Can I undo a redaction after downloading?", a: "No — once applied and downloaded, the redaction is permanent for that file. Keep your original if you might need it again." },
  ],
  summarize: [
    { q: "Does this work on scanned PDFs?", a: "Only if the PDF has a selectable text layer. Purely scanned images with no OCR applied won't have any text to summarize." },
    { q: "Is there a document length limit?", a: "Very long documents are truncated to roughly the first 60,000 characters before summarizing, and the page tells you when that happens." },
  ],
  ask: [
    { q: "Can I ask about multiple PDFs at once?", a: "Not yet — this version handles one document per conversation." },
    { q: "Does it remember earlier answers in the same session?", a: "Yes, within a conversation it keeps a short rolling history so follow-up questions have context." },
  ],
  translate: [
    { q: "Does this preserve the original layout, fonts, and images exactly?", a: "No — the text is extracted, translated, and rebuilt into a clean new PDF. True pixel-identical translation (same layout and graphics in a new language) needs a full desktop-publishing engine, which is beyond what a browser-based tool can do responsibly. This is closer in spirit to PDF-to-Word: it prioritizes getting an accurate, readable translation over exact visual fidelity." },
    { q: "Does it work for languages with non-Latin scripts, like Japanese or Arabic?", a: "Yes — rendering goes through your browser's own font system rather than a limited built-in PDF font, so the correct characters display for any of the 26 supported languages as long as your device has fonts for that script installed (true on virtually all modern systems)." },
  ],
  "ai-html-to-pdf": [
    { q: "How is this different from the regular HTML to PDF tool?", a: "The regular tool just renders whatever HTML you give it, exactly as-is. This one sends the HTML to Claude first, which strips navigation, ads, and clutter, and reformats the real content with proper headings and structure — useful when you've copied a full webpage's source and just want the actual article as a clean PDF." },
    { q: "Can I paste a full webpage's HTML source?", a: "Yes — that's the main use case. View-source or a saved .html file both work; the surrounding chrome (nav, sidebars, footers) gets filtered out automatically." },
  ],
  "ai-pdf-to-html": [
    { q: "Is the generated HTML safe to open?", a: "The preview renders in a sandboxed iframe that blocks any scripts from running, so nothing in the AI-generated content can execute code in your browser — even by accident. The downloaded file is plain HTML with no scripts." },
    { q: "How is this different from PDF to Word?", a: "PDF to Word extracts plain text with no structure. This tool asks Claude to infer headings, paragraphs, lists, and tables from the extracted text and output proper semantic HTML — better suited for publishing to a website or CMS than a Word document would be." },
  ],
  "detect-plagiarism": [
    { q: "Does this search the internet or academic databases for matches?", a: "No — this isn't a match-against-the-internet checker like Turnitin or Copyscape. Claude reads the document's writing itself and flags passages with signals like sudden tone or vocabulary shifts, generic/templated phrasing, or a voice that's inconsistent with the rest of the text. Treat a flag as \"worth a second look,\" not proof of copying." },
    { q: "Why did it flag something that isn't actually plagiarized?", a: "Natural writing variety — a technical section reading differently from an introduction, for instance — can look similar to the signals this tool watches for. It's a heuristic, not a certified report; use your judgment on anything flagged." },
    { q: "Does this work on scanned PDFs?", a: "Only if the PDF has a selectable text layer. Purely scanned images with no OCR applied won't have any text to analyze." },
  ],
  "remove-background": [
    { q: "Does this upload my photo anywhere?", a: "No — background removal runs entirely in your browser using an on-device AI model. The only network activity is a one-time download of that model (a few MB) the first time you use it, the same way the OCR tool's engine works; your photo itself never leaves your device." },
    { q: "What file formats does this support?", a: "JPG, PNG, and WebP in; the result downloads as a PNG with a transparent background." },
    { q: "Why does the first run take longer than expected?", a: "The AI model downloads once on first use and is cached by your browser after that — later uses on the same device are noticeably faster." },
  ],
  "pdf-to-pdfa": [
    { q: "Does this guarantee full PDF/A (ISO 19005) compliance?", a: "No — this is a best-effort conversion. It embeds the standard PDF/A identification metadata and document info a validator looks for, but doesn't perform full archival validation such as verifying every font is embedded or attaching a color output profile. For a legally mandated archival submission, verify the result with a dedicated PDF/A validator first." },
    { q: "Will this change how my PDF looks?", a: "No — the page content itself isn't touched, only metadata is added. Visually the file is identical to the original." },
  ],
  "pdf-to-markdown": [
    { q: "Will headings, tables, and lists come out correctly?", a: "The tool infers structure from formatting cues — larger text becomes headings, aligned columns become table cells, and lines starting with bullets or numbers become lists. It works well on cleanly formatted documents; PDFs with unusual layouts may need light manual cleanup afterward." },
    { q: "Does this work on scanned PDFs?", a: "Only if the PDF has a selectable text layer. Purely scanned images with no OCR applied have no text to extract — run OCR PDF first." },
    { q: "Are links preserved?", a: "Yes — clickable links in the original PDF are carried over as Markdown links." },
  ],
  "scan-to-pdf": [
    { q: "Do the photos I take get uploaded anywhere?", a: "Yes, briefly — unlike this app's other tools, which run entirely in your browser, the photos have to pass through our server to travel from your phone to your computer. They're deleted from the server the moment your computer retrieves them to build the PDF." },
    { q: "How long is the QR code valid for?", a: "15 minutes from when it's generated. If it expires before you're done, just refresh the page on your computer for a new one." },
    { q: "Can I remove a page before saving?", a: "Yes — tap the trash icon on any thumbnail on your phone to discard it before tapping Save." },
  ],
};

export function getToolFaqs(slug: string): FaqItem[] {
  return TOOL_FAQS[slug] ?? [];
}
