import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/toolsConfig";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { SITE_URL, INDEXING_ENABLED } from "@/lib/pageMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  // Same kill switch as robots.ts — an empty sitemap on a dev/preview
  // deployment has nothing for a search engine to find even if it ignores
  // the disallow-all in robots.txt.
  if (!INDEXING_ENABLED) return [];

  const toolEntries = TOOLS.filter((t) => t.status === "live").map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const staticPages = ["/features", "/blog", "/faq", "/contact", "/privacy", "/terms", "/cookies"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolEntries,
    ...blogEntries,
    ...staticPages,
  ];
}
