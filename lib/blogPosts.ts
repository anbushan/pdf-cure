export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "cta"; text: string; href: string; label: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  category: string;
  content: ContentBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "merge-pdf-files-free-without-uploading",
    title: "How to merge PDF files for free — without uploading them anywhere",
    description:
      "A walkthrough of merging PDFs in the right order, and why doing it in your browser instead of on someone's server is worth caring about.",
    date: "2026-06-02",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "Merging PDFs sounds trivial until you're the one doing it for the fifth time this week — combining scanned receipts, stitching together a contract with its exhibits, or assembling a report from pieces written by different people. The mechanics are simple. The part worth thinking about is where that merging actually happens." },
      { type: "h2", text: "Why the 'upload your file' step matters more than it seems" },
      { type: "p", text: "Most free PDF tools online work the same way: you upload your files to their server, their server merges them, and you download the result. For a random meme image that's fine. For a signed lease, a medical record, or a draft contract, it's a step you're taking on faith — trusting a service you probably found through a search result to handle a document that might contain your address, your signature, or someone else's private information." },
      { type: "p", text: "That's not a reason to panic about every online tool. It's a reason to prefer the ones that don't need the upload step at all." },
      { type: "h2", text: "Merging in the browser, step by step" },
      { type: "ol", items: [
        "Open the Merge PDF tool and add your files — drag them in or select them from a picker.",
        "Reorder them if needed. Order matters for merging; whatever order the list shows is the order the pages come out in.",
        "Click merge. The combining happens using your browser's own processing — nothing is sent anywhere.",
        "Download the result. That's it — there's no server-side queue, no 'processing, please wait' spinner tied to someone else's infrastructure.",
      ]},
      { type: "h2", text: "When you might still want a server-based tool" },
      { type: "p", text: "Client-side processing has one real tradeoff: very large files are limited by your device's memory rather than a beefy server's. If you're merging genuinely enormous documents — think hundreds of megabytes each — a server-side tool with more horsepower might finish faster. For the overwhelming majority of everyday merging, that tradeoff doesn't come up." },
      { type: "cta", text: "Ready to try it yourself?", href: "/tools/merge", label: "Open Merge PDF" },
    ],
  },
  {
    slug: "pdf-compression-explained",
    title: "PDF compression explained: why your file is big and what actually shrinks it",
    description:
      "What actually makes a PDF large, why 'compress' tools behave differently on different files, and how to pick the right compression level.",
    date: "2026-06-10",
    readMinutes: 5,
    category: "Guides",
    content: [
      { type: "p", text: "You compress a PDF, and sometimes it shrinks by 90%. Sometimes it barely moves. That inconsistency isn't a bug — it's because PDFs aren't one kind of file, they're a container that can hold very different kinds of content, and each kind compresses differently." },
      { type: "h2", text: "What's actually taking up the space" },
      { type: "ul", items: [
        "Scanned pages — each page is really just a photograph, often saved at a much higher resolution than needed for screen reading. This is almost always the biggest opportunity for savings.",
        "Embedded fonts — a PDF that embeds a full font file for every typeface used can carry real weight, especially with several fonts in one document.",
        "Vector graphics and text — actual selectable text and line-drawn graphics are usually tiny; a 40-page text-only report might be a few hundred kilobytes.",
        "Duplicate objects — the same logo or background image repeated on every page, stored inefficiently, adds up fast in badly-generated PDFs.",
      ]},
      { type: "h2", text: "Why compression tools re-render pages as images" },
      { type: "p", text: "A properly built PDF compressor would go object by object — recompress this embedded JPEG, subset that font to only the characters actually used, remove duplicate resources — the way desktop software like Acrobat does. Most in-browser tools, including this one, take a different approach: they render each page as an image and re-encode it at a lower quality, then rebuild the PDF from those images." },
      { type: "p", text: "This trades some sharpness — especially on small text — for a much smaller, much simpler operation that a browser can actually do quickly. For scanned documents, this is close to what a proper compressor would do anyway, since scanned pages are already images. For text-heavy documents, it's a blunter tool: you'll get a smaller file, but selectable text becomes part of a flattened image, which also means it stops being searchable or copyable." },
      { type: "h2", text: "Picking a compression level" },
      { type: "p", text: "If the document is a scan (a contract someone signed and photographed, for instance), a higher compression level is usually safe — you're not losing much you didn't already lose when it was scanned. If the document has real, sharp text you care about keeping crisp and searchable, start at the lowest compression setting and only increase it if the file is still too large." },
      { type: "cta", text: "Try it on your own file", href: "/tools/compress", label: "Open Compress PDF" },
    ],
  },
  {
    slug: "ilovepdf-alternatives-what-to-look-for",
    title: "iLovePDF alternatives: what to actually look for in a PDF tool",
    description:
      "A practical checklist for evaluating free PDF tools — privacy, honesty about limitations, and what 'free' really means.",
    date: "2026-06-25",
    readMinutes: 5,
    category: "Comparisons",
    content: [
      { type: "p", text: "Search for almost any PDF task — merge, compress, convert to Word — and you'll get a dozen nearly identical-looking results. Most of them work fine for a one-off task. The differences that matter show up when you use these tools regularly, or when the document actually matters." },
      { type: "h2", text: "Where does your file actually go?" },
      { type: "p", text: "This is the single most important question and the one most sites answer vaguely. 'We take your privacy seriously' in a footer isn't an answer. What you want to know: does processing happen on their server, or in your browser? If it's server-side, how long is the file retained, and is that stated anywhere concrete rather than in general terms?" },
      { type: "h2", text: "Does it tell you what it can't do well?" },
      { type: "p", text: "Converting a PDF to an editable Word document, extracting tables to Excel, or doing OCR on a scan are all things that range from 'works great' to 'technically runs but the output is unusable' depending on the source document and the tool's actual approach. A tool that's honest about this — flagging conversions that are lossy, or simply not offering ones it can't do well — is more trustworthy than one that claims everything works perfectly." },
      { type: "h2", text: "A quick checklist" },
      { type: "ul", items: [
        "Can you tell, concretely, whether your file is processed locally or uploaded?",
        "Is there a real limit on free usage, and is it stated upfront rather than discovered at checkout?",
        "Does the tool explain when a conversion is lossy, rather than presenting every result as perfect?",
        "Is there a functioning way to actually delete your account and data, if you made one?",
      ]},
      { type: "p", text: "None of this means every server-based tool is worse — some tasks genuinely need server-side power. It's just worth knowing which kind of tool you're using, and choosing the browser-based option when the task allows for it." },
      { type: "cta", text: "See how this site handles it", href: "/faq", label: "Read our FAQ" },
    ],
  },
  {
    slug: "password-protect-pdf-guide",
    title: "How to password-protect a PDF — and when AES-256 actually matters",
    description:
      "What PDF encryption actually requires, how this site's Protect PDF tool does it entirely in your browser, and when a stronger password matters more than the algorithm.",
    date: "2026-06-29",
    readMinutes: 5,
    category: "Guides",
    content: [
      { type: "p", text: "A password-protected PDF isn't just a file with a prompt bolted on. The PDF spec defines actual encryption standards applied to the document's internal streams, plus a permissions layer controlling whether the file can be printed or copied even by someone who knows the password. Getting this right is a real cryptographic undertaking, not a checkbox." },
      { type: "h2", text: "Why this took a dedicated library" },
      { type: "p", text: "pdf-lib, the library this site uses for merging, splitting, and most page-level editing, deliberately doesn't implement encryption — it's a substantial, security-sensitive piece of work on its own. Protect PDF here uses a small, purpose-built library instead (@pdfsmaller/pdf-encrypt) that does nothing but PDF encryption, built on top of the Web Crypto API that's already built into your browser. Unlock works the same way in reverse, via its counterpart @pdfsmaller/pdf-decrypt." },
      { type: "h2", text: "What 'AES-256, in your browser' actually means" },
      { type: "ul", items: [
        "The encryption itself runs through the Web Crypto API — the same browser-native cryptography primitive used for things like WebAuthn, not a hand-rolled implementation.",
        "Your file and your chosen password never leave your device — there's no server round-trip for either the file or the password, which matters since a password is exactly the kind of thing you don't want passing through a third party.",
        "The result is a standard encrypted PDF — it'll prompt for a password in Acrobat, Preview, or any other PDF reader, not just on this site.",
      ]},
      { type: "h2", text: "The part encryption strength can't fix" },
      { type: "p", text: "AES-256 is a strong cipher, but it protects the file, not your choice of password. A PDF encrypted with a strong algorithm and the password \"1234\" is still trivially crackable — the algorithm was never the weak link. If the document actually matters, spend your effort on a long, unique password rather than worrying about which encryption standard is behind it; any modern implementation, including this one, uses one strong enough that it isn't the practical risk." },
      { type: "cta", text: "Add a password to a PDF", href: "/tools/protect", label: "Open Protect PDF" },
    ],
  },
  {
    slug: "pdf-to-pdfa-archival-format-explained",
    title: "PDF/A explained: when you actually need archival format",
    description:
      "What makes PDF/A different from a regular PDF, who actually requires it, and what a browser-based converter can and can't guarantee.",
    date: "2026-07-02",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "PDF/A shows up in one specific situation: something official — a thesis repository, a legal filing system, a government records office — requires it by name, and a regular PDF gets rejected. Outside that situation, almost nobody needs it, which is why it's worth understanding what it actually changes before you go looking for a converter." },
      { type: "h2", text: "What PDF/A restricts that a normal PDF allows" },
      { type: "ul", items: [
        "No encryption or password protection — an archived document has to stay openable by anyone, indefinitely, without a password that might get lost.",
        "No JavaScript or embedded executable content — nothing that depends on a specific piece of software behaving a specific way decades from now.",
        "No reliance on external content — fonts have to be embedded in the file itself, not assumed to be installed on whatever computer eventually opens it.",
        "Required metadata — identifying information baked into the file declaring it conforms to the standard, which is what a compliance checker actually looks for.",
      ]},
      { type: "h2", text: "What a best-effort browser converter can and can't do" },
      { type: "p", text: "This site's PDF to PDF/A tool embeds the standard PDF/A identification metadata and rebuilds the document's structure the same way Repair PDF does, which fixes a class of common issues. What it doesn't do is full ISO 19005 validation — verifying that literally every font is embedded, or attaching a color output profile, which a strict validator like veraPDF checks for and which realistically needs more than a browser can do on its own." },
      { type: "h2", text: "The honest recommendation" },
      { type: "p", text: "If a submission portal rejects your file for not being valid PDF/A, run it through a dedicated validator (veraPDF is free and thorough) before resubmitting, rather than assuming a best-effort conversion cleared every bar. For most everyday archiving — keeping a record of something for yourself — a regular PDF is genuinely fine; PDF/A is a requirement to satisfy, not a general upgrade." },
      { type: "cta", text: "Convert a PDF to PDF/A", href: "/tools/pdf-to-pdfa", label: "Open PDF to PDF/A" },
    ],
  },
  {
    slug: "heic-vs-jpg-iphone-photos-to-pdf",
    title: "HEIC vs JPG: why iPhone photos won't upload anywhere, and how to fix it",
    description:
      "Why HEIC exists, why so many web forms and tools silently reject it, and how to turn iPhone photos into a PDF without leaving your phone.",
    date: "2026-07-06",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "You take a photo on an iPhone, try to attach it somewhere, and either the upload silently fails or the image shows up as a gray box with a filename ending in .heic. This isn't a bug in whatever you're using — it's a genuinely different file format that a lot of software, especially on Windows and Android, was never taught to read." },
      { type: "h2", text: "Why Apple uses HEIC at all" },
      { type: "p", text: "HEIC (High Efficiency Image Container) typically produces a file less than half the size of an equivalent JPG at the same visual quality — meaningful when a phone is taking thousands of photos with finite storage. Apple made it the default camera format starting with iOS 11. The tradeoff: HEIC is a much newer, less universally supported format than JPG, which has been a safe bet everywhere since the 1990s." },
      { type: "h2", text: "Where this actually bites" },
      { type: "ul", items: [
        "Uploading to a web form that only checks for .jpg/.png extensions and rejects or silently drops anything else.",
        "Sending a photo to someone on Windows or Android who opens it and gets nothing viewable without installing a codec.",
        "Trying to build a PDF from photos, where most JPG-only tools simply won't accept the file.",
      ]},
      { type: "h2", text: "Converting without round-tripping through email-to-yourself" },
      { type: "p", text: "The common workaround — emailing photos to yourself, which sometimes auto-converts them — is unreliable and slow. This site's HEIC to PDF tool decodes HEIC/HEIF straight to JPEG using a WebAssembly build of libheif, running entirely in your browser, then builds the PDF from the decoded images the same way JPG to PDF does. No email round-trip, and the photo never leaves your device." },
      { type: "p", text: "One limitation worth knowing: if a HEIC file is a Live Photo or part of a burst, only the first frame converts — the motion and extra frames aren't part of a static PDF page anyway." },
      { type: "cta", text: "Turn iPhone photos into a PDF", href: "/tools/heic-to-pdf", label: "Open HEIC to PDF" },
    ],
  },
  {
    slug: "fill-out-pdf-form-without-printing",
    title: "How to fill out a PDF form without printing it",
    description:
      "The difference between a real fillable form and a flat scanned one, and how to handle both without a printer.",
    date: "2026-07-09",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "\"Print, fill out by hand, scan back in\" is still the default workflow a lot of people reach for with a PDF form — mostly because it always works, regardless of what kind of PDF it is. It's also almost never necessary anymore, and skipping it depends on knowing which of two very different kinds of form you're actually holding." },
      { type: "h2", text: "Real form fields vs. a flat page that looks like a form" },
      { type: "p", text: "Some PDFs have actual interactive form fields built in — an AcroForm, in PDF terms — with real text boxes, checkboxes, and dropdowns you can click into. Others are just a scanned or exported image of a form: it looks fillable, but there's nothing to click, because it's a picture, not a form." },
      { type: "h2", text: "Handling each one" },
      { type: "ol", items: [
        "If the PDF has real form fields, Fill PDF Form reads them directly — their type, their position, their current value — and lets you type into text fields, tick checkboxes, and pick from dropdowns using the form's own structure, not a guess at where text should go.",
        "If it's a flat scanned form with no real fields, Add Text to PDF lets you place free-form text anywhere on the page by eye — the same result, achieved by drawing text at a position you choose rather than filling a structured field.",
      ]},
      { type: "h2", text: "Making the result official" },
      { type: "p", text: "Once a form is filled, Fill PDF Form has a \"flatten when done\" option that bakes the values permanently into the page and removes the underlying fields — turning an editable form into a static, submission-ready document. If you're handed a PDF that someone else already filled out and just need to lock it down the same way, Flatten PDF does that directly without re-entering anything." },
      { type: "cta", text: "Fill out a PDF form", href: "/tools/fill-form", label: "Open Fill PDF Form" },
    ],
  },
  {
    slug: "delete-extract-redact-pdf-pages-difference",
    title: "Delete, extract, or redact: three ways to remove something from a PDF, and when each is right",
    description:
      "Removing a page, pulling a page out, and blacking out text inside a page all sound similar but solve different problems.",
    date: "2026-07-13",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "\"Get rid of this\" is one instruction that maps to three genuinely different tools, depending on what \"this\" is — a whole page you don't want anymore, a page you want to keep but separately, or a specific sentence buried inside a page you're otherwise keeping." },
      { type: "h2", text: "Remove Pages — you don't want this page at all" },
      { type: "p", text: "Removing pages deletes them from the document entirely. What's left keeps its own original page numbers if any were printed on the pages themselves — deleting a page from the file doesn't retroactively renumber whatever's physically drawn on the remaining ones." },
      { type: "h2", text: "Extract Pages — you want this page, just on its own" },
      { type: "p", text: "Extraction pulls selected pages into a brand-new file without touching the original — useful for splitting one section out of a larger report to send separately, while keeping the source document intact. The distinction from Remove Pages is which file you end up caring about: extraction keeps both; removal keeps only what's left behind." },
      { type: "h2", text: "Redact — the page stays, but this specific text has to actually disappear" },
      { type: "p", text: "Redaction operates inside a page rather than on whole pages — blacking out a specific name, account number, or paragraph while leaving everything else on that page untouched. The part that matters: real redaction has to permanently flatten what's underneath the black box, not just draw a rectangle over it, since a black box drawn on top of selectable text can still be selected, copied, and read right through it in some viewers. This site's Redact tool rebuilds the page's content so the covered text is actually gone, not just visually hidden." },
      { type: "cta", text: "Permanently black out sensitive text", href: "/tools/redact", label: "Open Redact PDF" },
    ],
  },
  {
    slug: "bank-statement-pdf-to-excel-budgeting",
    title: "How to turn a bank statement PDF into a spreadsheet for budgeting",
    description:
      "Why bank statement PDFs are unusually hard to parse, and how to get dates, amounts, and running balance into a spreadsheet without retyping every line.",
    date: "2026-07-16",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "A monthly budget usually starts with the same tedious step: opening a bank statement PDF and manually retyping transaction rows into a spreadsheet, because copy-pasting out of a PDF table tends to produce a jumbled mess of numbers with the column structure gone." },
      { type: "h2", text: "Why bank statements are a harder case than most PDF tables" },
      { type: "p", text: "A generic \"PDF to Excel\" tool works by detecting column alignment on the page — it doesn't know that one column is a date, another is a running balance, and another is specifically a debit versus a credit. Bank statements also vary a lot bank to bank: some put debits and credits in separate columns, others use a single signed amount column, and date formats aren't consistent either." },
      { type: "h2", text: "What a purpose-built converter does differently" },
      { type: "p", text: "Bank Statement to Excel is tuned specifically for this shape of document — it looks for the pattern of a date, a description, and one or more amount columns per row, and maps them into consistent date, description, debit, credit, and balance columns regardless of which of those layout variants the source statement uses. It's not a general table extractor wearing a bank-statement label; it's built around the specific patterns bank statements actually follow." },
      { type: "h2", text: "What still needs a manual check" },
      { type: "p", text: "Multi-line transaction descriptions, statements with unusual multi-currency formatting, or a scanned (non-selectable-text) statement are the cases most likely to need a quick manual fix afterward — run OCR PDF first if the statement is a scan with no text layer at all." },
      { type: "cta", text: "Convert a bank statement", href: "/tools/bank-statement-to-excel", label: "Open Bank Statement to Excel" },
    ],
  },
  {
    slug: "ocr-pdf-explained-searchable-scans",
    title: "OCR explained: how a scanned PDF becomes searchable text",
    description:
      "What OCR is actually doing under the hood, why it's not always perfect, and how it makes a photographed document searchable and selectable.",
    date: "2026-07-20",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "A scanned document — whether it came from an actual scanner or just a phone camera — is a photograph as far as a computer is concerned. Ctrl+F finds nothing, because there's no text there to find, only pixels that happen to look like letters to a human reading them." },
      { type: "h2", text: "What OCR is actually doing" },
      { type: "p", text: "Optical Character Recognition analyzes the shapes on the page and predicts which characters they represent, then adds that predicted text as an invisible, selectable layer positioned right on top of the original image. Visually, nothing changes — you're still looking at the same scan. Functionally, the page now has real text behind it that a browser or PDF reader can search, select, and copy." },
      { type: "h2", text: "Why OCR runs entirely in your browser here" },
      { type: "p", text: "OCR PDF uses Tesseract.js, a WebAssembly build of the open-source Tesseract OCR engine, running as a Web Worker so it doesn't freeze the page while it works. The recognition itself happens on your device — the scan doesn't get sent anywhere to be read." },
      { type: "h2", text: "What affects accuracy" },
      { type: "ul", items: [
        "Scan quality — a crisp, well-lit, straight scan recognizes far more accurately than a blurry or heavily skewed phone photo.",
        "Handwriting — Tesseract, like most OCR engines, is built for printed text; handwriting recognition is a different, much less reliable problem.",
        "Unusual fonts or heavy stylization — decorative typefaces or low-contrast text reduce accuracy the same way they'd challenge a human skimming quickly.",
      ]},
      { type: "cta", text: "Make a scan searchable", href: "/tools/ocr", label: "Open OCR PDF" },
    ],
  },
  {
    slug: "split-long-pdf-into-equal-chapters",
    title: "How to split a long PDF into equal chunks without typing out every page range",
    description:
      "Splitting a 200-page document into chapters or batches by count instead of hand-entering page ranges.",
    date: "2026-07-23",
    readMinutes: 3,
    category: "Guides",
    content: [
      { type: "p", text: "Splitting a PDF by custom page ranges — \"1-3,5,7-9\" — works well when the sections are irregular and you actually know where they fall. It's the wrong tool for a 200-page scanned book you just want broken into 20-page batches, where typing out ten separate ranges by hand is its own tedious task." },
      { type: "h2", text: "Two different splitting problems" },
      { type: "p", text: "\"Split at these specific points\" and \"split into equal pieces\" are different enough problems that Split PDF now has two separate modes rather than forcing the second case through range syntax. Custom ranges are still there for the first case — pulling out a specific chapter, or separating an exhibit from a contract." },
      { type: "h2", text: "Splitting every N pages" },
      { type: "p", text: "Switch to \"Every N pages\" mode, enter how many pages each output file should have, and the document is chunked into consecutive groups of that size automatically — the last file just gets whatever pages are left over if the total doesn't divide evenly. A 100-page document split at 20 pages each becomes five files, no range typing involved." },
      { type: "p", text: "Setting it to 1 page per file is also the fastest way to break a document into individual single-page PDFs, without listing out every page number by hand." },
      { type: "cta", text: "Split a PDF", href: "/tools/split", label: "Open Split PDF" },
    ],
  },
  {
    slug: "resize-pdf-a4-letter-legal-for-printer",
    title: "A4 vs Letter vs Legal: resizing a PDF for the printer you actually have",
    description:
      "Why a PDF made for one page size prints oddly on another, and how to rescale it properly instead of letting the printer guess.",
    date: "2026-07-27",
    readMinutes: 3,
    category: "Guides",
    content: [
      { type: "p", text: "A4 and US Letter are close enough in size that most people never notice the difference — until a document built for one gets printed on the other, and margins shift, content overflows onto a stray second page, or a print dialog's \"fit to page\" setting stretches everything just slightly out of proportion." },
      { type: "h2", text: "Why this happens" },
      { type: "p", text: "A4 is 210 × 297mm; US Letter is 8.5 × 11in (215.9 × 279.4mm) — narrower and taller versus wider and shorter, not just a different total area. A PDF's pages have their exact size baked in; a printer or PDF viewer set to \"fit to page\" is making a real-time guess about how to reconcile that with a different physical sheet, and guesses vary between printers and software." },
      { type: "h2", text: "Resizing properly instead of guessing at print time" },
      { type: "p", text: "Resize PDF Pages rescales every page to a real target size — A4, Letter, Legal, or A3 — ahead of time, so the file itself matches the paper rather than relying on the printer to reconcile a mismatch. Scaling is uniform (never stretched non-proportionally) and centered, so a size difference shows up as a bit of extra margin on two sides rather than as distortion." },
      { type: "cta", text: "Resize a PDF", href: "/tools/resize-pdf", label: "Open Resize PDF Pages" },
    ],
  },
  {
    slug: "pdf-metadata-what-it-reveals-before-you-share",
    title: "What's hiding in a PDF's metadata before you share it",
    description:
      "The title, author, and software fields baked into a PDF that don't show up on the page — and how to check and clear them before sending a file out.",
    date: "2026-07-30",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "Nothing about how a PDF looks on screen tells you what's stored about it behind the scenes. Right-click a PDF and look at its properties, though, and there's usually a Title, an Author, a Subject, and sometimes Keywords — filled in automatically by whatever created the file, and rarely reviewed by whoever ends up sending it somewhere." },
      { type: "h2", text: "Where this data actually comes from" },
      { type: "p", text: "Most of it is set automatically, not typed in deliberately. A Word document saved to PDF often carries over the Windows username of whoever created or last edited the source file into the Author field. Scanning software sometimes stamps its own product name into the metadata. None of this is usually a secret someone meant to share — it's just a byproduct nobody looked at." },
      { type: "h2", text: "When it actually matters" },
      { type: "ul", items: [
        "Sharing a document externally that still carries an internal author name, a previous draft's title, or a company's scanning-software fingerprint.",
        "A journalist, researcher, or legal team submitting a PDF where the metadata itself could reveal who actually wrote or handled it.",
        "Publishing a template or document publicly where you'd rather the file's own properties matched what's actually on the page.",
      ]},
      { type: "h2", text: "Checking and clearing it" },
      { type: "p", text: "Edit PDF Metadata shows the current Title, Author, Subject, and Keywords and lets you change or clear any of them — emptying a field removes it rather than leaving the old value in place. It only touches this invisible layer; nothing on the visible pages changes." },
      { type: "cta", text: "Check a PDF's metadata", href: "/tools/edit-metadata", label: "Open Edit PDF Metadata" },
    ],
  },
  {
    slug: "sign-pdf-without-docusign",
    title: "How to sign a PDF without DocuSign",
    description:
      "When you actually need an audit-trailed e-signature service, and when just placing a signature on the page is enough.",
    date: "2026-08-03",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "DocuSign and similar services exist to solve a specific problem: proving, with a verifiable audit trail, that a specific person agreed to a specific document at a specific time — the kind of thing that matters for a legally binding contract between parties who don't fully trust each other. Most signing situations aren't actually that." },
      { type: "h2", text: "When you genuinely need an audit trail" },
      { type: "p", text: "If a signature needs to hold up as evidence later — a commercial contract, a legal agreement between separate organizations — a dedicated e-signature service that timestamps and verifies the signing event is the right tool, and worth whatever it costs." },
      { type: "h2", text: "When you just need your signature on a page" },
      { type: "p", text: "A permission slip, an internal form, a document you're signing and sending to someone who already trusts you — these don't need a verified audit trail, just your actual signature visibly on the page. Sign PDF lets you draw a signature with your mouse or finger, or type your name in a handwriting-style font, and place it wherever it needs to go, entirely in your browser." },
      { type: "h2", text: "The honest limitation" },
      { type: "p", text: "This is a visual signature, not a cryptographically verified one — there's no timestamp authority or identity verification behind it, the same way there wouldn't be if you printed the page and signed it with a pen. For anything where that verification actually matters, that's exactly the situation a proper e-signature service is built for." },
      { type: "cta", text: "Sign a PDF", href: "/tools/sign", label: "Open Sign PDF" },
    ],
  },
  {
    slug: "compress-pdf-for-email-attachment-limits",
    title: "Compressing a PDF to fit Gmail and Outlook attachment limits",
    description:
      "What Gmail's and Outlook's actual attachment limits are, and how to get a PDF under them without guessing at a compression level.",
    date: "2026-08-06",
    readMinutes: 3,
    category: "Guides",
    content: [
      { type: "p", text: "\"Your message has an attachment that's too large\" is a familiar bounce for anyone who's tried to email a scanned contract or a photo-heavy report. Gmail caps attachments at 25MB; Outlook.com and Microsoft 365 typically cap at 20MB (and some corporate configurations set it lower still) — limits that a handful of scanned pages at camera resolution can hit surprisingly fast." },
      { type: "h2", text: "Compress vs. Compress to Target Size" },
      { type: "p", text: "Compress PDF shrinks a file by re-encoding its pages at a compression level you choose — fast, and usually enough when you're not chasing an exact number. Compress to Target Size solves the more specific version of this problem: tell it the size you need to land under, and it works through compression levels for you until the result fits — useful when you know the exact ceiling (say, 20MB for an Outlook recipient) and don't want to guess at a percentage." },
      { type: "h2", text: "If compression alone isn't enough" },
      { type: "p", text: "A handful of very large scanned images sometimes can't shrink enough through compression alone without becoming illegible. In that case, splitting the document into two smaller emails (Split PDF) or sharing a link instead of an attachment are the practical fallbacks — no compression setting fixes a file that's fundamentally too much content for one message." },
      { type: "cta", text: "Shrink a PDF for email", href: "/tools/compress-to-size", label: "Open Compress to Target Size" },
    ],
  },
  {
    slug: "id-photo-passport-photo-at-home",
    title: "How to make a passport or ID photo at home",
    description:
      "Getting a compliant-sized ID photo without a print shop — and the one thing this kind of tool can't verify for you.",
    date: "2026-08-10",
    readMinutes: 3,
    category: "Guides",
    content: [
      { type: "p", text: "Passport and visa photos have to meet specific pixel and print-size requirements that vary by country and document type — which is normally the reason people end up paying a print shop or pharmacy counter a few dollars just to take one photo under the right conditions." },
      { type: "h2", text: "What actually needs to be right" },
      { type: "ul", items: [
        "Exact dimensions at print resolution, not just \"looks about square\" — most issuers reject photos that are close but not precisely sized.",
        "A plain, solid-color background, usually white or off-white, with no shadows or texture behind the subject.",
        "The subject correctly framed and centered within the frame, without cropping into hair or shoulders unnaturally.",
      ]},
      { type: "h2", text: "What a browser tool can do, and what it can't" },
      { type: "p", text: "ID Photo Maker crops and resizes a photo you already have onto a solid-color canvas at standard passport and visa presets, choosing between filling the whole frame (cropping any excess, the usual choice for a headshot) or fitting the entire photo inside it. What it can't do is remove or fix an actual background behind the subject in the original photo — if the photo was taken against a cluttered wall, that's still there; this tool frames and sizes, it doesn't replace what's already in the shot." },
      { type: "h2", text: "Always double-check the spec" },
      { type: "p", text: "Presets target common published sizes, but requirements genuinely vary by country and by document type (passport vs. visa vs. national ID). Confirm the current exact spec for your specific application before submitting — a close-but-wrong size is exactly the kind of thing that gets a photo rejected at the counter." },
      { type: "cta", text: "Make an ID photo", href: "/tools/id-photo", label: "Open ID Photo Maker" },
    ],
  },
  {
    slug: "pdf-to-markdown-for-notion-wiki",
    title: "Turning a PDF into a Notion- or wiki-ready Markdown document",
    description:
      "Getting a PDF's headings, tables, and links into clean Markdown instead of retyping a document by hand.",
    date: "2026-08-13",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "Moving a PDF's content into Notion, Obsidian, a GitHub wiki, or any other Markdown-based tool usually means either retyping the whole thing or pasting it in as one shapeless block of text with every heading, list, and table flattened into plain paragraphs." },
      { type: "h2", text: "How structure gets inferred from a PDF" },
      { type: "p", text: "A PDF doesn't actually store \"this is a heading\" or \"this is a bulleted list\" as a labeled concept the way a Word document or Markdown file does — it just has text positioned and sized on a page. PDF to Markdown works backward from that: text noticeably larger than the surrounding body text becomes a heading, lines starting with a bullet character or a number become a list, and text arranged in aligned columns becomes a Markdown table." },
      { type: "h2", text: "What carries over well, and what doesn't" },
      { type: "ul", items: [
        "Clickable links in the original PDF are preserved as Markdown links, not just plain text.",
        "Cleanly formatted, single-column documents — reports, articles, simple guides — convert well with little cleanup needed.",
        "Dense multi-column layouts or unusual formatting are harder to infer correctly and may need manual touch-up afterward.",
        "A scanned PDF with no selectable text layer has nothing to extract — run OCR PDF first.",
      ]},
      { type: "h2", text: "When you just want the raw text instead" },
      { type: "p", text: "If you don't need structure at all — just the words, to paste somewhere or search through — PDF to Text skips the heading/table inference entirely and exports a plain, line-broken text file instead." },
      { type: "cta", text: "Convert a PDF to Markdown", href: "/tools/pdf-to-markdown", label: "Open PDF to Markdown" },
    ],
  },
  {
    slug: "read-pdf-aloud-turn-document-into-audiobook",
    title: "Turning any PDF into something you can listen to instead of read",
    description:
      "Using your browser's built-in text-to-speech to listen to a long document page by page, hands-free.",
    date: "2026-08-17",
    readMinutes: 3,
    category: "Guides",
    content: [
      { type: "p", text: "Some documents are long enough, or arrive at a bad enough time, that reading them at a desk isn't realistic — a lengthy report right before a commute, a contract you'd rather listen to while doing something else. Turning a PDF into an audiobook usually means a dedicated app, an account, or a file conversion step most people never bother with." },
      { type: "h2", text: "What's actually doing the reading" },
      { type: "p", text: "Read PDF Aloud doesn't use an AI voice model or send your document anywhere — it reads the extracted text using your browser's own built-in speech synthesis (the same underlying API screen readers use), picking from whatever voices your operating system already has installed. That's why available voices look different on a phone versus a laptop: they come from your device, not from this site." },
      { type: "h2", text: "How it's meant to be used" },
      { type: "p", text: "The document is read one page at a time, with playback controls for play, pause, and stepping between pages, plus a voice and speed picker. It's built for following along or listening passively to a page at a time — not for producing a downloadable audio file, since the voice and pacing come from your device in the moment rather than from a rendered audio track." },
      { type: "h2", text: "What it can't read" },
      { type: "p", text: "Same limitation as any text-based tool on this site: it needs a selectable text layer to read from. A purely scanned document with no text underneath the image has nothing to extract — run OCR PDF on it first, then it'll read the same as any other PDF." },
      { type: "cta", text: "Listen to a PDF", href: "/tools/read-aloud", label: "Open Read PDF Aloud" },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
