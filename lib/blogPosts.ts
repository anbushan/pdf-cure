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
    slug: "password-protect-pdf-guide",
    title: "How to password-protect a PDF (and why we don't do it in your browser)",
    description:
      "What PDF encryption actually requires, why it's a genuinely hard thing to do safely in JavaScript, and what to use instead today.",
    date: "2026-06-18",
    readMinutes: 4,
    category: "Guides",
    content: [
      { type: "p", text: "If you've looked for a 'Protect PDF' button on this site and not found one, that's deliberate — not an oversight. It's worth explaining why, because the reason says something about the difference between a tool that looks like it works and one that actually does." },
      { type: "h2", text: "What PDF encryption actually involves" },
      { type: "p", text: "A password-protected PDF isn't just a file with a password prompt bolted on. The PDF specification defines actual encryption standards (historically RC4, now AES) applied to the document's internal streams, plus a permissions system controlling whether the file can be printed, copied from, or edited even by someone who knows the password. Doing this correctly means implementing real cryptography according to a fairly detailed spec." },
      { type: "h2", text: "Why that's a bad fit for browser-only tools" },
      { type: "ul", items: [
        "The library this app uses for everything else, pdf-lib, doesn't implement PDF encryption at all — and for good reason, since it's a substantial, security-sensitive undertaking to get right.",
        "A half-correct implementation is worse than none: a PDF that looks encrypted but uses a weak or buggy scheme gives false confidence to whoever relies on it being actually protected.",
        "This is exactly the kind of feature where 'it opened without a password prompt in my testing' isn't the same as 'this is safe.'",
      ]},
      { type: "h2", text: "What to use instead, for now" },
      { type: "p", text: "Desktop tools like Adobe Acrobat, or the built-in 'Protect' features in recent versions of Microsoft Word and macOS Preview, implement PDF encryption properly. If you need to send someone a password-protected PDF today, one of those is the reliable path — not a tool that added the feature quickly because the button was easy to draw." },
      { type: "cta", text: "See what this site can do instead", href: "/", label: "Browse all tools" },
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
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
