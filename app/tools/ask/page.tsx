import type { Metadata } from "next";
import { buildToolMetadata, buildToolJsonLd } from "@/lib/pageMetadata";
import { getTool, CATEGORY_TKEY } from "@/lib/toolsConfig";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTools from "@/components/RelatedTools";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = buildToolMetadata("ask");

export default function Page() {
  const jsonLd = buildToolJsonLd("ask");
  const tool = getTool("ask")!;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category, href: `/#${tool.category.toLowerCase()}`, categoryKey: CATEGORY_TKEY[tool.category] },
          { label: tool.name, toolSlug: "ask" },
        ]}
      />
      <ComingSoon tool={tool} />
      <RelatedTools slug="ask" />
    </>
  );
}
