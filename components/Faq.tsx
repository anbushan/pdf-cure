"use client";

import JsonLd from "./JsonLd";
import { useLanguage } from "./LanguageProvider";
import { getSiteFaqs } from "@/lib/i18n/faqTranslations";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqProps {
  items: FaqItem[];
  title?: string;
  /** Appends 2 translated general FAQs (privacy/free) after the tool-specific ones. */
  includeGeneral?: boolean;
}

export default function Faq({ items, title = "Frequently asked questions", includeGeneral }: FaqProps) {
  const { locale } = useLanguage();
  const allItems = includeGeneral ? [...items, ...getSiteFaqs(locale).slice(1, 3)] : items;

  if (allItems.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-4">
      <JsonLd data={jsonLd} />
      {title && <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-3">{title}</h2>}
      <div className="divide-y divide-paper-line border-t border-b border-paper-line">
        {allItems.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-ink marker:content-none">
              {item.q}
              <span className="shrink-0 text-ink-faint transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2.5 text-base leading-relaxed text-ink-faint">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
