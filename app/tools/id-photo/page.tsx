import type { Metadata } from "next";
import { buildToolMetadata, buildToolJsonLd } from "@/lib/pageMetadata";
import { getTool, CATEGORY_TKEY } from "@/lib/toolsConfig";
import { getToolFaqs } from "@/lib/faqContent";
import JsonLd from "@/components/JsonLd";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import RelatedTools from "@/components/RelatedTools";
import Client from "./Client";

export const metadata: Metadata = buildToolMetadata("id-photo");

export default function Page() {
  const jsonLd = buildToolJsonLd("id-photo");
  const tool = getTool("id-photo")!;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category, href: `/category/${tool.category.toLowerCase()}`, categoryKey: CATEGORY_TKEY[tool.category] },
          { label: tool.name, toolSlug: "id-photo" },
        ]}
      />
      <Client />
      <RelatedTools slug="id-photo" />
      <Faq items={getToolFaqs("id-photo")} includeGeneral title={`${tool.name} — frequently asked questions`} />
      <div className="mx-auto max-w-2xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} className="mb-16" />
      </div>
    </>
  );
}
