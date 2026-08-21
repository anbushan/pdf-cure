import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/lib/toolsConfig";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { SITE_URL, INDEXING_ENABLED } from "@/lib/pageMetadata";
import { ROUTED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/locales";

/** Builds the reciprocal hreflang map for a path that exists at every routed locale, English included. */
function hreflang(path: string): Record<string, string> {
  const languages: Record<string, string> = { [DEFAULT_LOCALE]: `${SITE_URL}${path}`, "x-default": `${SITE_URL}${path}` };
  for (const locale of ROUTED_LOCALES) languages[locale] = `${SITE_URL}/${locale}${path}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Same kill switch as robots.ts — an empty sitemap on a dev/preview
  // deployment has nothing for a search engine to find even if it ignores
  // the disallow-all in robots.txt.
  if (!INDEXING_ENABLED) return [];

  // Stamped once per build rather than per-request, so every URL that
  // doesn't track its own real edit date (i.e. everything but blog posts)
  // reports the same, honest "last built" date instead of a fake one.
  const buildDate = new Date();

  const liveTools = TOOLS.filter((t) => t.status === "live");

  const toolEntries = liveTools.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: buildDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: hreflang(`/tools/${tool.slug}`) },
  }));

  // Every routed locale's own copy of each tool page — same URL set
  // hreflang above points to, just listed explicitly so a crawler that
  // reaches the sitemap without following hreflang still finds them.
  const toolLocaleEntries = ROUTED_LOCALES.flatMap((locale) =>
    liveTools.map((tool) => ({
      url: `${SITE_URL}/${locale}/tools/${tool.slug}`,
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: hreflang(`/tools/${tool.slug}`) },
    }))
  );

  const categoryEntries = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/category/${category.toLowerCase()}`,
    lastModified: buildDate,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: { languages: hreflang(`/category/${category.toLowerCase()}`) },
  }));

  const categoryLocaleEntries = ROUTED_LOCALES.flatMap((locale) =>
    CATEGORIES.map((category) => ({
      url: `${SITE_URL}/${locale}/category/${category.toLowerCase()}`,
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: { languages: hreflang(`/category/${category.toLowerCase()}`) },
    }))
  );

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const staticPages = ["/features", "/blog", "/faq", "/contact", "/privacy", "/terms", "/cookies"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: buildDate,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  const localeHomeEntries = ROUTED_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    alternates: { languages: hreflang("") },
  }));

  return [
    {
      url: SITE_URL,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: hreflang("") },
    },
    ...localeHomeEntries,
    ...toolEntries,
    ...toolLocaleEntries,
    ...categoryEntries,
    ...categoryLocaleEntries,
    ...blogEntries,
    ...staticPages,
  ];
}
