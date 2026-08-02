import type { MetadataRoute } from "next";
import { SITE_URL, INDEXING_ENABLED } from "@/lib/pageMetadata";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
