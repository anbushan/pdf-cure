import type { Metadata } from "next";
import { buildToolMetadata, buildToolJsonLd } from "@/lib/pageMetadata";
import { getTool, CATEGORY_TKEY } from "@/lib/toolsConfig";
import { getToolFaqs } from "@/lib/faqContent";
import JsonLd from "@/components/JsonLd";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import RelatedTools from "@/components/RelatedTools";
import AiGate from "@/components/AiGate";
import Client from "./Client";

export const metadata: Metadata = buildToolMetadata("ai-html-to-pdf");

export default function Page() {
  const jsonLd = buildToolJsonLd("ai-html-to-pdf");
  const tool = getTool("ai-html-to-pdf")!;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category, href: `/#${tool.category.toLowerCase()}`, categoryKey: CATEGORY_TKEY[tool.category] },
          { label: tool.name, toolSlug: "ai-html-to-pdf" },
        ]}
      />
      <AiGate tool={tool}>
        <Client />
      </AiGate>
      <RelatedTools slug="ai-html-to-pdf" />
      <Faq items={getToolFaqs("ai-html-to-pdf")} includeGeneral title={`${tool.name} — frequently asked questions`} />
      <div className="mx-auto max-w-2xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} className="mb-16" />
      </div>
    </>
  );
}
