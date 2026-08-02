import type { Metadata } from "next";
import { buildToolMetadata, buildToolJsonLd } from "@/lib/pageMetadata";
import { getTool, CATEGORY_TKEY } from "@/lib/toolsConfig";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTools from "@/components/RelatedTools";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = buildToolMetadata("summarize");

export default function Page() {
  const jsonLd = buildToolJsonLd("summarize");
  const tool = getTool("summarize")!;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category, href: `/#${tool.category.toLowerCase()}`, categoryKey: CATEGORY_TKEY[tool.category] },
          { label: tool.name, toolSlug: "summarize" },
        ]}
      />
      <ComingSoon tool={tool} />
      <RelatedTools slug="summarize" />
    </>
  );
}
