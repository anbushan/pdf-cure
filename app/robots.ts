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
      // Account and admin pages require auth and carry their own noindex
      // meta already — excluding them here too saves crawl budget and
      // keeps them out of server logs analyzed by bots. The API isn't
      // a page a crawler should ever fetch.
      disallow: ["/account/", "/admin/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
