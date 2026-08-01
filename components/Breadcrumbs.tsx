"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import JsonLd from "./JsonLd";
import { SITE_URL } from "@/lib/pageMetadata";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";
import type { TKey } from "@/lib/i18n/translations";

export interface Crumb {
  label: string; // English fallback, and what's used for JSON-LD (kept consistent for SEO)
  href?: string; // omit for the current page (last item)
  toolSlug?: string; // if set, the visible label resolves via tool translations
  categoryKey?: TKey; // if set, the visible label resolves via the category translation (e.g. "catOrganize")
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { locale, t } = useLanguage();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  function displayLabel(item: Crumb) {
    if (item.toolSlug) return getToolLabel(item.toolSlug, locale, item.label, "").name;
    if (item.categoryKey) return t(item.categoryKey);
    return item.label;
  }

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl px-6 pt-6">
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-ink-faint/50" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink transition-colors">
                {displayLabel(item)}
              </Link>
            ) : (
              <span className="text-ink font-medium" aria-current="page">
                {displayLabel(item)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
