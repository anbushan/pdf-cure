import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildToolMetadata, buildToolJsonLd } from "@/lib/pageMetadata";
import { getTool, CATEGORY_TKEY, TOOLS } from "@/lib/toolsConfig";
import { getToolFaqs } from "@/lib/faqContent";
import { ROUTED_LOCALES } from "@/lib/i18n/locales";
import { getToolLabel } from "@/lib/i18n/toolTranslations";
import { TOOL_CLIENTS } from "@/lib/toolClientRegistry";
import JsonLd from "@/components/JsonLd";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import RelatedTools from "@/components/RelatedTools";

// Only live tools get a translated URL — a "soon" tool has nothing
// substantive to show yet in any language, English included.
const LIVE_SLUGS = TOOLS.filter((t) => t.status === "live").map((t) => t.slug);

export const dynamicParams = false;

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of ROUTED_LOCALES) {
    for (const slug of LIVE_SLUGS) params.push({ locale, slug });
  }
  return params;
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }): Metadata {
  if (!getTool(params.slug)) return {};
  return buildToolMetadata(params.slug, params.locale);
}

export default function LocaleToolPage({ params }: { params: { locale: string; slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool || tool.status !== "live") notFound();

  const Client = TOOL_CLIENTS[params.slug];
  if (!Client) notFound();

  const jsonLd = buildToolJsonLd(params.slug, params.locale);
  const label = getToolLabel(params.slug, params.locale, tool.name, tool.description);

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category, href: `/category/${tool.category.toLowerCase()}`, categoryKey: CATEGORY_TKEY[tool.category] },
          { label: tool.name, toolSlug: params.slug },
        ]}
      />
      <Client />
      <RelatedTools slug={params.slug} />
      <Faq items={getToolFaqs(params.slug)} includeGeneral title={`${label.name} — frequently asked questions`} />
      <div className="mx-auto max-w-2xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} className="mb-16" />
      </div>
    </>
  );
}
