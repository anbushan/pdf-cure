import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import { CATEGORIES, TOOLS, ToolCategory } from "@/lib/toolsConfig";
import Breadcrumbs from "@/components/Breadcrumbs";
import FeaturesHeading from "./FeaturesHeading";
import { TOOL_ICONS } from "@/components/toolIcons";
import { Zap, Lock, Globe, MessageSquarePlus, Smartphone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: `Features | ${SITE_NAME} — every PDF tool, AI feature, and how it works`,
  description:
    "A complete overview of every PDFCure feature: browser-based PDF editing tools, AI summarization/chat/translation, offline support, and privacy details.",
  alternates: { canonical: `${SITE_URL}/features` },
  openGraph: {
    title: `Features | ${SITE_NAME}`,
    description: "A complete overview of every PDFCure feature.",
    url: `${SITE_URL}/features`,
    siteName: SITE_NAME,
    type: "website",
  },
};

const CATEGORY_BLURBS: Record<ToolCategory, string> = {
  AI: "Three AI-assisted tools that read, translate, and answer questions about a PDF for you — the only tools on this site that call a server.",
  Organize: "Restructure a PDF: combine files, split them apart, remove or extract pages, reorder, and spot differences between versions.",
  Optimize: "Shrink file size for sending, uploading, or archiving.",
  Convert: "Move content between PDF and other formats — images, Word, Excel, and HTML.",
  Edit: "Stamp, number, rotate, and trim pages.",
  Security: "Sign documents and permanently remove sensitive content.",
};

const PLATFORM_FEATURES = [
  { icon: Zap, title: "Runs in your browser", body: "Every editing tool processes your file locally using JavaScript — nothing is uploaded for Merge, Split, Compress, or any tool outside the AI category. See exactly which three tools are the exception on the Privacy Policy page." },
  { icon: Lock, title: "No account required", body: "Every tool works immediately. There's no sign-up wall, no email capture, and no watermark added to your files." },
  { icon: Smartphone, title: "Installable, works offline", body: "Add PDFCure to your home screen or desktop as an app. After a first visit, the editing tools keep working with no internet connection." },
  { icon: Globe, title: "26-language interface", body: "Switch the interface language from the header — covers the navigation, hero, and common actions across the whole site." },
  { icon: MessageSquarePlus, title: "Feedback, built in", body: "A feedback button in the header and a full contact page mean a real way to reach someone, not a dead-end support email." },
  { icon: ShieldCheck, title: "Honest about limitations", body: "Tools that can't be done well in a browser (PDF encryption, OCR, PDF↔PowerPoint) are clearly marked \"coming soon\" instead of faking a broken result." },
];

export default function FeaturesPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Features" }]} />

      <div className="mx-auto max-w-3xl px-6 pt-4">
        <FeaturesHeading />

        {/* Platform-level features */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLATFORM_FEATURES.map((f) => (
            <div key={f.title} className="paper-stack p-5">
              <f.icon size={18} className="text-teal-dark mb-2" />
              <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-faint">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Every tool, by category, with real links */}
        <div className="mt-14 space-y-10">
          {CATEGORIES.map((category) => {
            const tools = TOOLS.filter((t) => t.category === category);
            return (
              <section key={category}>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{category} tools</h2>
                <p className="mt-1 text-base text-ink-faint">{CATEGORY_BLURBS[category]}</p>
                <ul className="mt-4 divide-y divide-paper-line border-t border-b border-paper-line">
                  {tools.map((tool) => {
                    const Icon = TOOL_ICONS[tool.slug];
                    return (
                      <li key={tool.slug} className="flex items-center gap-3 py-3">
                        {Icon && (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-paper-dim text-ink-faint">
                            <Icon size={15} />
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          {tool.status === "live" ? (
                            <Link href={`/tools/${tool.slug}`} className="text-sm font-medium text-ink hover:text-amber-dark transition-colors">
                              {tool.name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-ink-faint">{tool.name}</span>
                          )}
                          <p className="text-xs text-ink-faint">{tool.description}</p>
                        </div>
                        {tool.status === "soon" ? (
                          <span className="eyebrow shrink-0 rounded-full border border-ink-faint/30 px-2 py-1 text-ink-faint" title={tool.soonReason}>
                            soon
                          </span>
                        ) : (
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="shrink-0 text-xs font-medium text-amber-dark hover:text-amber-dark/80"
                          >
                            Open →
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-14 paper-stack p-6 text-center">
          <p className="text-sm text-ink-faint">
            Have a question that's not covered here? Check the{" "}
            <Link href="/faq" className="text-amber-dark underline">FAQ</Link>, read the{" "}
            <Link href="/blog" className="text-amber-dark underline">blog</Link>, or{" "}
            <Link href="/contact" className="text-amber-dark underline">get in touch</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
