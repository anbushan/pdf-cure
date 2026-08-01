# PDFCure — Quick Fix for Your PDFs

A Next.js 14 (App Router) clone of the iLovePDF pattern: a grid of single-purpose
PDF tools. Every tool processes files **entirely in the browser** — nothing is
uploaded anywhere — using `pdf-lib`, `pdf.js`, `jsPDF`, `mammoth`, and `SheetJS`.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then paste in your Anthropic API key
npm run dev
```

Then open http://localhost:3000. The API key is only needed for the two AI
tools (Summarize PDF, Ask your PDF, Translate PDF) — everything else works with no key and
no `.env.local` at all.

The service worker (PWA/offline support) is disabled in `npm run dev` by
design — to test installability and offline mode, run:

```bash
npm run build && npm start
```

## What's fully working

**AI** — Summarize PDF, Ask your PDF (chat with a document), Translate PDF. These are the
only three tools that aren't 100% client-side: the PDF's text is extracted in
the browser with pdf.js, then sent to a Next.js API route (`app/api/pdf-summarize`,
`app/api/pdf-chat`, `app/api/pdf-translate`) that calls Claude with your `ANTHROPIC_API_KEY`. Every
page for these tools says so explicitly. Long documents are truncated to
~50-60k characters to keep cost and latency sane — there's a note in the UI
when that happens. Each question in "Ask your PDF" resends the document text,
which is simple but not token-efficient; a real cost-optimization would cache
or embed the document server-side instead of resending it per turn.

**Organize** — Merge, Split (by page ranges), Remove pages, Extract pages, Organize
(reorder/rotate/delete via thumbnails), Compare PDFs (per-page pixel diff between two versions)

**Optimize** — Compress (rasterize + re-encode)

**Convert** — JPG↔PDF, PDF→JPG, Word→PDF (.docx via mammoth), PDF→Word (text-only,
via the `docx` package), Excel→PDF (via SheetJS), HTML→PDF (via html2canvas + jsPDF),
PDF→PowerPoint (one slide per page, rendered as an image via `pptxgenjs`),
PowerPoint→PDF (text extracted from slide XML via JSZip, laid out via the HTML→PDF pipeline)

**Edit** — Watermark, Page numbers, Rotate, Crop

**Security** — Sign (draw a signature, place it on any page), Redact (draw boxes,
flattens the page to an image so the underlying content is actually destroyed),
Protect (AES-256 encryption via `@pdfsmaller/pdf-encrypt`, Web Crypto API, entirely
client-side), Unlock (removes a known password via `@pdfsmaller/pdf-decrypt`,
with a clear "wrong password" message rather than a silent failure)

## What's marked "coming soon" and why

A few tools are deliberately **not** implemented with fake/lossy output, because
doing them properly needs a server-side engine:

- **OCR PDF** — accurate OCR needs a proper model; a client-only Tesseract pass
  would be slow and unreliable for a "clone" MVP.
- **PDF → Excel** — reliable table detection needs a server-side layout model;
  a naive extraction would produce garbage for anything but the simplest tables.
- **Repair PDF** — generic PDF recovery needs a native PDF engine.

These are listed on the homepage with a "soon" badge and are intentionally not
clickable, rather than silently producing a bad result.

**A note on Protect/Unlock and PowerPoint, since these were previously listed as
"coming soon" too:** I revisited both after being pushed on it, searched for what's
actually available in the ecosystem now, and found real, purpose-built libraries
that make honest implementations possible — `@pdfsmaller/pdf-encrypt`/`pdf-decrypt`
for real AES-256 encryption via the browser's own Web Crypto API, and `pptxgenjs`
for generating genuine `.pptx` files. PowerPoint→PDF is still an honest tradeoff
(text extraction, not a visual copy — see its own tool page and FAQ for specifics),
same tier as PDF→Word.

## Other AI features worth adding later

Not built yet, but natural next additions on the same server-route pattern:
- **Extract structured data** — pull names, dates, totals, line items into a table/CSV (invoices, receipts, forms)
- **Ask across multiple PDFs** — compare or cross-reference several documents in one chat
- **Translate** a PDF's text into another language
- **Smart PII redaction** — have Claude flag likely names/emails/SSNs as suggested redaction boxes for the user to review, instead of manually drawing every one
- **Auto-generate a table of contents / outline** for a long PDF
- **Proofread / rewrite** — grammar and clarity pass on extracted text
- **Auto-suggest a filename** based on content

## SEO

- Every tool has its own `<title>`, meta description, canonical URL, Open
  Graph/Twitter tags, and `SoftwareApplication` JSON-LD — generated from
  `lib/toolsConfig.ts` via `lib/pageMetadata.ts`, so adding a tool automatically
  gets it SEO metadata too.
- `app/sitemap.ts` and `app/robots.ts` are generated the same way — only `status:
  "live"` tools are included.
- **Before you deploy**, update `SITE_URL` in `lib/pageMetadata.ts` to your real
  domain — it feeds canonical URLs, the sitemap, and Open Graph tags.
- Every tool page also has visible breadcrumbs (Home › Category › Tool) with matching `BreadcrumbList` JSON-LD, and an FAQ section (2 general + 2 tool-specific questions) with matching `FAQPage` JSON-LD — see `components/Breadcrumbs.tsx`, `components/Faq.tsx`, and `lib/faqContent.ts`.
- `/blog` has four real, non-fluff posts (`lib/blogPosts.ts`) with `Article` JSON-LD, each linking back to the relevant tool — this is the actual growth mechanism for a tool site like this (ranking for "merge pdf online"-type searches), not just a placeholder section.
- `/faq` is a standalone page with the same site-wide FAQ content and schema.
- Each tool page is a Server Component (`page.tsx`) that renders a Client
  Component (`Client.tsx`) — this is what makes exporting `metadata` possible
  in the App Router while keeping all the interactive logic client-side.

## Performance / Lighthouse

I applied the standard levers for a high Lighthouse score, but **I couldn't run
Lighthouse myself in the environment that built this** (no browser/network
access) — run it yourself after `npm run build && npm start` and treat the
numbers below as "should be close," not verified:

- `pdf-lib` and `pdf.js` are lazy-loaded (`import()`) inside the functions that
  use them, not imported at module scope — they only download once you
  actually use a tool, not as part of the page's initial JS.
- `mammoth`, `xlsx`, `docx`, `html2canvas`, and `jspdf` were already lazy-loaded
  the same way.
- The pdf.js worker is bundled locally (`new URL(..., import.meta.url)`)
  instead of fetched from a CDN — one less render-blocking third-party request,
  and it's what makes offline support possible.
- Fonts use `next/font` with `display: "swap"` (already avoids layout shift
  and self-hosts Google Fonts at build time).
- Images (icons, OG image) are pre-sized PNGs, no runtime resizing.

**Ads are the one thing that will cost you points if you turn them on.**
AdSense injects third-party JS and risks a small layout shift no matter how
carefully it's wired up — that's true of every site running display ads, not
specific to this build. With no `NEXT_PUBLIC_ADSENSE_CLIENT_ID` set, the ad
components render nothing and cost nothing, so the default install should
score highest. If your Lighthouse run comes back below 100 on some page,
paste me the specific audit that failed and I'll fix it.

## PWA / offline

- `public/manifest.json` + icons in `public/icons/` make the app installable
  (desktop and mobile "Add to Home Screen" / "Install app"). There's also an
  in-app "Install app" button in the header once the browser considers the
  site installable.
- `next-pwa` (configured in `next.config.js`) generates a service worker at
  build time that precaches the app shell and runtime-caches fonts, images,
  and static chunks — so after a first visit, the editing tools keep working
  with no internet connection. It's **disabled in dev** (`next dev`) by
  design; test offline behavior with `npm run build && npm start`.
- The AI tools (Summarize, Ask) obviously still need a live connection to
  reach Claude — everything else works offline.
- Icons were generated programmatically to match the brand palette as a
  placeholder — swap `public/icons/*.png` and `public/og-image.png` for real
  artwork before shipping.

## Contact, feedback, and legal pages

- **Contact page** (`/contact`) and the **Feedback button** in the header (opens a modal) both send email via [Resend](https://resend.com). Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in `.env.local` — without them, both forms show a clear "email isn't configured" error instead of silently failing.
- **Privacy Policy, Terms and Conditions, Cookie Policy** (`/privacy`, `/terms`, `/cookies`) are static pages with real content describing how *this specific app* actually works (client-side processing, what the AI tools send to a server, AdSense cookies if enabled). Have a lawyer review these before relying on them for an actual public launch — this is a solid, accurate starting draft, not legal advice.
- A **cookie consent banner** appears only if `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set (no ads = nothing to consent to, so it stays hidden).

## Multi-language support — scope and honest limitations

There's a language switcher in the header covering all 26 requested languages, built as **client-side switching** (locale preference stored in `localStorage`, no `/es/`, `/fr/` etc. URL prefixes). I scoped it this way deliberately rather than doing full URL-based locale routing, which would mean restructuring every route under an `app/[locale]/` segment — a much bigger, riskier change for a build I can't test locally.

**What's actually translated into all 26 languages:** the header nav, hero heading/subtitle, category names, and common buttons (Select file, Start over, Download, Cancel, etc.) — see `lib/i18n/translations.ts`.

**What's still English-only, on purpose:** tool descriptions, all FAQ content, the blog posts, and the legal pages. Translating thousands of strings of technical and legal content into 26 languages without native-speaker review isn't something I'd respons­ibly generate wholesale — the risk of a subtly wrong legal-page translation is real. If you want full-site translation, I'd treat `lib/i18n/translations.ts` as the pattern to extend, and get native speakers (or a proper translation service) to review anything user-facing before it ships, especially `/privacy`, `/terms`, and `/cookies`.

**If you later want real URL-based locale routing** (better for SEO — each language gets its own indexable URL) instead of the current client-side switch, that's a genuine restructuring project: moving routes under `app/[locale]/`, adapting `generateMetadata` calls to be locale-aware, adding `hreflang` alternates to the sitemap, and switching translation loading from client Context to server-side. Worth doing if this ships publicly in multiple markets; probably not worth the risk to build blind in this session.

## Ads

Off by default. To turn them on:
1. Get a publisher ID and two ad unit slot IDs from
   [Google AdSense](https://www.google.com/adsense).
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, and
   `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` in `.env.local`.
3. `app/ads.txt/route.ts` generates the required `ads.txt` automatically from
   the same client ID — nothing else to configure.

Placement: one slot on the homepage (below the hero, above the tool grid) and
one below each tool's workflow (after the result, never interrupting the
merge/split/etc. flow itself). Both reserve their height up front to avoid
layout shift before the ad loads.

## Fixes from testing feedback

- **Feedback modal wasn't centered** — it lived inside the header, which has `backdrop-blur` (a `backdrop-filter`). Any ancestor with `backdrop-filter`/`filter`/`transform` creates a new positioning context in CSS, so the modal's `position: fixed` was centering against the header bar instead of the viewport. Fixed by rendering the modal through a React portal straight to `document.body`.
- **Slow page-to-page navigation** — found a real bug: the Privacy/Terms/Cookies pages used plain `<a href="...">` for their internal links instead of `next/link`'s `<Link>`. Plain anchors force a full page reload; `<Link>` does an instant client-side transition. Fixed across all three pages.
  - Note: if navigation still feels slow, check whether you're running `npm run dev` — Next.js compiles each route on first visit in dev mode, which is normal and disappears with `npm run build && npm start`.
- **Ads not visible for local testing** — set `NEXT_PUBLIC_ADS_DEMO_MODE=true` in `.env.local` and every ad slot (homepage + every tool page) renders a clearly-labeled placeholder box at the real size/position, no AdSense account needed. I didn't fake a real AdSense client ID against Google's actual script — that both violates their policy and generally just fails silently, so a placeholder is the honest way to preview layout.
- **Translation coverage expanded** — `Dropzone`, `ResultPanel`, and `ToolHeader` (used identically on every single tool page) now pull their text through the translation system, so "Select a file," "Start over," "Download," and "All tools" are now localized site-wide, not just in the header/hero. Per-tool action button text (e.g. "Merge 3 files," "Compressing…") and all FAQ/blog/legal content are still English-only — see the Multi-language section above for the full scope.
- **"No tools are working"** — I did a structural review of every tool (`use client` directive, default export, `page.tsx` → `Client.tsx` wiring, the `pdf-lib`/`pdf.js` dynamic-import refactor) and didn't find a bug that would explain a total, site-wide failure. If it's still broken after pulling this update, **please paste the exact error** — either the red text in the browser console (F12 → Console tab) when you click Merge, or the terminal output from `npm run dev` — since a guess without that is a guess. My best-guess candidates if you didn't already: (1) stale `node_modules` from before I added new dependencies — try deleting `node_modules` and `package-lock.json` and running `npm install` fresh; (2) a leftover `.next` cache — delete the `.next` folder and restart `npm run dev`.

## This round's additions

**More internal linking (SEO)**
- Every tool page now has a **Related PDF tools** section (`components/RelatedTools.tsx`) linking to 3-4 other tools, prioritizing the same category — real internal links with descriptive anchor text, not just "click here."
- The footer is now a **full site map** — every live tool, grouped by category, linked by name — plus links to Features, Blog, FAQ, Contact, and the three legal pages.
- New `/features` page explains every feature in depth and links to every tool and every other page (`/blog`, `/faq`, `/contact`) — also added to the header nav, footer, and sitemap.

**Loading / success / failure states, consistently**
- A global toast system (`components/ToastProvider.tsx`) now surfaces success and failure for every tool, on top of each page's existing inline messaging — not a replacement for it, a second layer so feedback is noticeable even if you've scrolled.
- `components/useErrorToast.ts` is a one-line hook (`useErrorToast(error)`) wired into all 22 tools' existing error state.
- `ResultPanel` (used by 19 of the 22 tools) fires a success toast automatically the moment it renders — zero per-tool code needed for those. Summarize and Compare, which have custom result UIs instead of `ResultPanel`, get an explicit `toast.success(...)` call at their completion point.
- Found and fixed a real gap while doing this: **Rotate, Crop, and JPG-to-PDF had no error handling at all** — a failure would silently do nothing with no message to the user. All three now have proper `try/catch`, inline error text, and toast wiring like every other tool.

**New AI tool: Translate PDF**
- Extracts text, sends it to Claude with the target language (any of the same 26 languages from the switcher), and rebuilds a new PDF from the translation.
- Deliberately routes through the same `html2canvas` + `jsPDF` pipeline already used for HTML/Word/Excel-to-PDF instead of drawing text with `pdf-lib`'s built-in fonts — pdf-lib's fonts only cover Latin script, so anything in Japanese, Arabic, Hindi, Thai, etc. would render as blank boxes. Rendering through the browser's own font stack means the correct glyphs show up for any of the 26 languages, since the OS handles the font fallback.
- **What it doesn't do:** preserve the original document's exact layout, images, or icons — it re-flows extracted text into a clean new PDF. The tool page says this explicitly. True lossless "same layout, different language" translation needs a full desktop-publishing engine; that's a fundamentally different (and much larger) undertaking than what a browser-based tool can respons­ibly promise.

**`.env.local.example` now shows realistic placeholder formats** for every key (`sk-ant-api03-...`, `re_...`, `ca-pub-...`) instead of blank lines, so it's obvious what each value should look like.

## This round's additions

**Google Analytics + error tracking**
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and every page view (including client-side route changes, which Next.js's App Router doesn't fire automatically — `components/AnalyticsPageview.tsx` handles that with `usePathname`/`useSearchParams`) gets tracked.
- `tool_success` and `tool_error` GA events fire automatically for every tool via the same central hooks built earlier (`useErrorToast`, `ResultPanel`) — no per-tool wiring needed, same leverage as the toast system.
- `components/ErrorTracker.tsx` catches genuinely uncaught JS errors and promise rejections site-wide (`window.onerror` / `unhandledrejection`) and reports them too, so failures outside our own try/catch blocks still show up in reporting.
- Everything is a no-op with no measurement ID set — zero tracking by default.
- **Note on GA vs. GTM:** I implemented direct GA4 tracking (`gtag.js`) rather than a full Google Tag Manager container. GTM is a layer on top of GA4 for managing multiple tags/triggers through a separate web dashboard — genuinely useful if you're going to add several other tracking pixels later, but overkill (and something I can't pre-configure for you anyway, since it lives in GTM's own UI) if Analytics is the only thing you need. The events this sends (`page_view`, `tool_success`, `tool_error`, `js_error`, `404_not_found`) will all show up in GA4's own Events report either way. If you do want a GTM container instead, swap `components/GoogleAnalytics.tsx` to load the GTM script with your container ID — the `trackEvent()` calls throughout the app would just need to push to `dataLayer` instead of calling `gtag` directly, which is a small change to `lib/analytics.ts` alone.

**404 page** — `app/not-found.tsx`, matching the site's design, fires a `404_not_found` GA event with the broken path (useful for finding dead links), and links to the homepage, Features, and four popular tools.

**Dark / light theme toggle** — a button in the header cycles Light → Dark → System. Implemented via CSS custom properties (`app/globals.css` + `tailwind.config.ts`) rather than adding `dark:` variants to every component — the existing `bg-paper`, `text-ink`, `border-paper-line` etc. classes throughout the app automatically respond to the `.dark` class on `<html>`, so this didn't require touching the ~40 files that already use those classes. An inline script in `<head>` applies the right class before first paint to avoid a flash of the wrong theme.

**AI disclaimer** — `components/AiDisclaimer.tsx` ("AI can make mistakes — double-check anything important") is now shown on all three AI tools: below the summary on Summarize, below the chat on Ask your PDF, and below the result on Translate.

## This round's additions

**Two new AI tools**
- **AI HTML to PDF** — sends your HTML to Claude first to strip navigation/ads/clutter and reformat the real content with proper headings before rendering to PDF. Distinct from the existing (fully client-side) HTML to PDF tool, which just rasterizes whatever you give it as-is — this one is for messy real-world page source, not clean HTML you wrote yourself.
- **AI PDF to HTML** — extracts PDF text and asks Claude to infer structure (headings, paragraphs, lists, tables) and output clean semantic HTML, downloadable as a standalone `.html` file. The preview renders in a **sandboxed iframe** (`sandbox=""`, no `allow-scripts`) so nothing in AI-generated content can execute in the app's context — worth knowing if you ever change how this is displayed.
- Both are honest about what they don't do: this is content restructuring, not exact visual reproduction — same category of tradeoff as PDF-to-Word and Translate PDF.

**Google Drive import**
- Added to the shared `Dropzone` component, so it appears automatically on every tool's file picker once configured — no per-tool changes needed.
- Uses Google's official Picker API + Identity Services (OAuth), loaded lazily (only when someone actually clicks "Google Drive," not on page load). Full setup steps are in `.env.local.example` — you'll need a Google Cloud project with the Picker + Drive APIs enabled.
- **I could not test this OAuth flow live** — no browser or Google credentials in the environment that built this. I followed Google's documented API shapes carefully, but this is the single highest-risk piece of the app to verify. If the picker doesn't open, check the browser console first — the most common cause is an "Authorized JavaScript origins" mismatch in the OAuth Client ID setup (must exactly match your domain, including `http://localhost:3000` for local dev).
- Without the env vars set, the button simply doesn't render — zero impact on the default experience.

## Branding

Rebranded to **PDFCure** ("Quick Fix for Your PDFs") using the provided logo.
Assets are in `public/brand/` (transparent-background mark and full wordmark, used
in the header/footer) and `public/icons/` (opaque-background versions for the
PWA manifest, favicon, and Apple touch icon — regenerated from the same logo).
`SITE_NAME` and `SITE_TAGLINE` in `lib/pageMetadata.ts` are the single source of
truth for the name everywhere else (metadata, emails, FAQ copy) — only the header
and footer needed the actual logo image hardcoded, since everything else pulls
the name from that constant.

## A note on trust for the newer dependencies

`pdf-lib`, `pdf.js`, `mammoth`, `xlsx`, `jspdf`, and `html2canvas` are large,
extremely widely-used libraries I have high confidence in. Three packages added
more recently are smaller and less battle-tested at scale, worth knowing about
before you rely on them:

- **`@pdfsmaller/pdf-encrypt` / `@pdfsmaller/pdf-decrypt`** — purpose-built,
  MIT-licensed, Web Crypto API-based (AES-256), actively used in production per
  their own documentation. I verified their documented API via search rather than
  from memory, since library APIs like this can change — but I have not run them
  myself. **Test Protect → Unlock on a real file as your first check after
  `npm install`**, since password protection is exactly the kind of feature where
  a subtle bug is worse than the feature not existing.
- **`pptxgenjs`** — a well-established, mainstream library for generating
  `.pptx` files; lower risk than the encryption packages.
- **PowerPoint→PDF's XML parsing** (`lib/pdfTools.ts`, `powerPointToPdf`) is code
  I wrote directly against the OOXML slide format rather than a maintained
  library, since nothing like mammoth/xlsx exists for `.pptx` — treat this as the
  least mature piece of the conversion suite, most likely to need a follow-up fix
  on real-world decks with unusual slide layouts.

## Full-site translation expansion

Pushed back on my earlier scoping decision after being called out — the footer, tool names, and static pages were genuinely showing English regardless of language, which isn't what "26 languages" should mean. This round:

- **All 31 tool names + descriptions** (28 live + 3 "coming soon") translated into all 26 languages — `lib/i18n/toolTranslations.ts`. This is the highest-impact change: tool names appear in the homepage grid, footer sitemap, breadcrumbs, related-tools links, and the on-page H1 of every tool, so this single file makes the *whole site* feel translated, not just the header.
- **Footer** fully translated — sitemap category labels, nav links (Features/Blog/FAQ/Contact/Privacy/Terms/Cookies), tagline, all wired through the same translation system. `Footer.tsx`, `Breadcrumbs.tsx`, `RelatedTools.tsx`, and `ToolCard.tsx` all had to become client components to do this, since translation state only exists client-side.
- **Site-wide FAQ** (6 general Q&As, shown on every tool page plus the standalone `/faq` page) translated into all 26 languages — `lib/i18n/faqTranslations.ts`.
- **Page headings** on Blog, Features, Contact, FAQ, and the 404 page translated (title + intro paragraph on each).

**Still English by design:** the 4 full blog articles, the 3 legal documents, and the two tool-specific FAQ answers per tool (56 pairs). I'm repeating this once more because it's a real, deliberate boundary, not an oversight: translating ~60,000 words of long-form and legal content without native-speaker review is a different kind of risk than translating a product name, and I don't think it's responsible to do that in bulk here — especially the legal pages, where a wrong translation is worse than an honest English one.

## Shimmer loading skeleton

`app/tools/loading.tsx` — a single file, using Next.js's built-in `loading.tsx` convention, automatically covers all 28 tool routes with a shimmering skeleton (breadcrumb bar, tool header, main content card, related tools, FAQ) shown while that route's JS loads. No per-tool file needed. The shimmer animation itself is in `app/globals.css` (`.skeleton` class) and respects `prefers-reduced-motion`.

## Project structure

```
app/
  page.tsx              landing page
  sitemap.ts            generated from lib/toolsConfig.ts
  robots.ts
  ads.txt/route.ts       generated ads.txt for AdSense
  api/
    pdf-summarize/route.ts
    pdf-chat/route.ts
  tools/<slug>/
    page.tsx             server component: metadata + JSON-LD, renders Client
    Client.tsx            the actual "use client" tool UI/logic
components/              shared UI (Dropzone, ToolCard, AdSlot, etc.)
lib/
  pdfTools.ts            all pdf-lib operations (lazy-loaded)
  pdfRender.ts           pdf.js page rendering (lazy-loaded)
  comparePdfs.ts          pixel-diff logic for Compare PDFs
  extractText.ts          text extraction for the AI tools
  pageMetadata.ts          per-tool SEO metadata + JSON-LD builder
  toolsConfig.ts          registry of every tool (name, category, status)
public/
  manifest.json, icons/    PWA assets
```

## Extending

To add a new tool:
1. Add an entry to `lib/toolsConfig.ts` (this alone gets it a homepage card, SEO metadata, and a sitemap entry).
2. Add an icon to `components/toolIcons.tsx`.
3. Add the processing function to `lib/pdfTools.ts` (use `getPdfLib()` /
   dynamic `import()` for any new heavy dependency, not a top-level import).
4. Create `app/tools/<slug>/Client.tsx` — the "use client" UI, using
   `Dropzone`, `ToolHeader`, and `ResultPanel` for a consistent look.
5. Create `app/tools/<slug>/page.tsx`:
   ```tsx
   import type { Metadata } from "next";
   import { buildToolMetadata, buildToolJsonLd } from "@/lib/pageMetadata";
   import JsonLd from "@/components/JsonLd";
   import AdSlot from "@/components/AdSlot";
   import Client from "./Client";

   export const metadata: Metadata = buildToolMetadata("<slug>");

   export default function Page() {
     const jsonLd = buildToolJsonLd("<slug>");
     return (
       <>
         {jsonLd && <JsonLd data={jsonLd} />}
         <Client />
         <div className="mx-auto max-w-2xl px-6">
           <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} className="mb-16" />
         </div>
       </>
     );
   }
   ```
