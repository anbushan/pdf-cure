import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_TKEY, CATEGORY_INTRO, TOOLS, type ToolCategory } from "@/lib/toolsConfig";
import { buildCategoryMetadata, buildCategoryJsonLd } from "@/lib/pageMetadata";
import { ROUTED_LOCALES } from "@/lib/i18n/locales";
import { getTranslations } from "@/lib/i18n/translations";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";

const SLUG_TO_CATEGORY: Record<string, ToolCategory> = Object.fromEntries(
  CATEGORIES.map((c) => [c.toLowerCase(), c])
);

export const dynamicParams = false;

export function generateStaticParams() {
  const params: { locale: string; category: string }[] = [];
  for (const locale of ROUTED_LOCALES) {
    for (const category of CATEGORIES) params.push({ locale, category: category.toLowerCase() });
  }
  return params;
}

export function generateMetadata({ params }: { params: { locale: string; category: string } }): Metadata {
  const category = SLUG_TO_CATEGORY[params.category];
  if (!category) return {};
  return buildCategoryMetadata(category, params.locale);
}

export default function LocaleCategoryPage({ params }: { params: { locale: string; category: string } }) {
  const category = SLUG_TO_CATEGORY[params.category];
  if (!category) notFound();

  const jsonLd = buildCategoryJsonLd(category, params.locale);
  const tools = TOOLS.filter((t) => t.category === category);
  const categoryName = getTranslations(params.locale)[CATEGORY_TKEY[category]];

  return (
    <div className="pb-24">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category, categoryKey: CATEGORY_TKEY[category] }]} />

      <section className="mx-auto max-w-6xl px-6 pt-4 pb-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{categoryName} PDF Tools</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-faint">{CATEGORY_INTRO[category]}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? ""} minHeight={90} className="mb-16" />
      </div>
    </div>
  );
}
