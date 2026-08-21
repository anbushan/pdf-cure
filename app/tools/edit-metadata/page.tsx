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

export const metadata: Metadata = buildToolMetadata("edit-metadata");

export default function Page() {
  const jsonLd = buildToolJsonLd("edit-metadata");
  const tool = getTool("edit-metadata")!;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category, href: `/category/${tool.category.toLowerCase()}`, categoryKey: CATEGORY_TKEY[tool.category] },
          { label: tool.name, toolSlug: "edit-metadata" },
        ]}
      />
      <Client />
      <RelatedTools slug="edit-metadata" />
      <Faq items={getToolFaqs("edit-metadata")} includeGeneral title={`${tool.name} — frequently asked questions`} />
      <div className="mx-auto max-w-2xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} className="mb-16" />
      </div>
    </>
  );
}
