import type { Metadata } from "next";
import { getTool, TOOLS, CATEGORY_INTRO, CATEGORY_TKEY, type ToolCategory } from "./toolsConfig";
import { TOOL_KEYWORDS, TOOL_SEO_OVERRIDES } from "./seoKeywords";
import { ROUTED_LOCALES, DEFAULT_LOCALE } from "./i18n/locales";
import { getToolLabel } from "./i18n/toolTranslations";
import { getTranslations } from "./i18n/translations";

// Update this once you know the real deployment domain — it feeds
// canonical URLs, Open Graph tags, and the sitemap.
export const SITE_URL = "https://pdfcure.app";
export const SITE_NAME = "PDFCure";
export const SITE_TAGLINE = "Quick Fix for Your PDFs";

/**
 * Kill switch for search engines — off by default, so a dev/staging/preview
 * deployment is never accidentally crawled or indexed while it's still
 * being tested. Set ENABLE_INDEXING=true (only on the real production
 * deployment) once you're actually ready to go live; that flips the root
 * layout's <meta name="robots">, robots.txt, and sitemap.xml all together
 * — see app/robots.ts and app/sitemap.ts.
 */
export const INDEXING_ENABLED = process.env.ENABLE_INDEXING === "true";

/**
 * Builds a reciprocal hreflang map — English (unprefixed) plus every
 * routed locale, each pointing at every other — from a function that
 * turns a locale code into that locale's URL for this page. `x-default`
 * points at the English URL, the convention search engines use for "show
 * this to anyone whose language didn't match one of the alternates."
 */
function buildHreflang(urlFor: (locale: string) => string): Record<string, string> {
  const languages: Record<string, string> = { [DEFAULT_LOCALE]: urlFor(DEFAULT_LOCALE) };
  for (const locale of ROUTED_LOCALES) languages[locale] = urlFor(locale);
  languages["x-default"] = urlFor(DEFAULT_LOCALE);
  return languages;
}

/** A locale-prefixed path, or the bare path for English (which stays unprefixed at today's URLs). */
function localeUrl(locale: string, path: string): string {
  return locale === DEFAULT_LOCALE ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export function buildToolMetadata(slug: string, locale: string = DEFAULT_LOCALE): Metadata {
  const tool = getTool(slug);
  const isEnglish = locale === DEFAULT_LOCALE;
  const override = isEnglish ? TOOL_SEO_OVERRIDES[slug] : undefined;

  // Non-English pages don't have hand-tuned SEO copy (that's a separate,
  // much bigger content project — see the translated-FAQ caveat in the
  // locale-routing plan) — they get the translated tool name/description
  // instead, which still beats an English title on a non-English SERP.
  const label = tool ? getToolLabel(slug, locale, tool.name, tool.description) : null;
  const title = override?.title ?? (label ? `${label.name} — free & private | ${SITE_NAME}` : SITE_NAME);
  const description =
    override?.description ??
    (label ? `${label.description} ${isEnglish ? "Runs in your browser — no upload, no sign-up, free." : SITE_TAGLINE}` : "Free, private PDF tools that run in your browser.");
  const keywords = isEnglish ? TOOL_KEYWORDS[slug] : undefined;
  const path = `/tools/${slug}`;
  const url = localeUrl(locale, path);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url, languages: buildHreflang((l) => localeUrl(l, path)) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/** JSON-LD SoftwareApplication schema for a tool page, as a plain object ready to stringify. */
export function buildToolJsonLd(slug: string, locale: string = DEFAULT_LOCALE) {
  const tool = getTool(slug);
  if (!tool) return null;
  const label = getToolLabel(slug, locale, tool.name, tool.description);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${label.name} — ${SITE_NAME}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in a web browser)",
    description: label.description,
    url: localeUrl(locale, `/tools/${slug}`),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** Metadata for a category hub page (/category/[slug]) — a real, indexable landing page rather than a homepage anchor. */
export function buildCategoryMetadata(category: ToolCategory, locale: string = DEFAULT_LOCALE): Metadata {
  const isEnglish = locale === DEFAULT_LOCALE;
  const categoryName = isEnglish ? category : getTranslations(locale)[CATEGORY_TKEY[category]];
  const title = `${categoryName} PDF Tools — Free & Private | ${SITE_NAME}`;
  const description = isEnglish
    ? `${CATEGORY_INTRO[category]} Every tool is free and runs entirely in your browser.`
    : `${categoryName} — ${SITE_TAGLINE}. ${SITE_NAME}.`;
  const path = `/category/${category.toLowerCase()}`;
  const url = localeUrl(locale, path);

  return {
    title,
    description,
    alternates: { canonical: url, languages: buildHreflang((l) => localeUrl(l, path)) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary", title, description },
  };
}

/** CollectionPage + ItemList JSON-LD listing every live tool in a category, for a category hub page. */
export function buildCategoryJsonLd(category: ToolCategory, locale: string = DEFAULT_LOCALE) {
  const tools = TOOLS.filter((t) => t.category === category && t.status === "live");
  const url = localeUrl(locale, `/category/${category.toLowerCase()}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category} PDF Tools`,
    description: CATEGORY_INTRO[category],
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: localeUrl(locale, `/tools/${tool.slug}`),
        name: getToolLabel(tool.slug, locale, tool.name, tool.description).name,
      })),
    },
  };
}

export function buildBlogPostMetadata(post: { slug: string; title: string; description: string; date: string }): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | ${SITE_NAME} Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.date,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
}

export function buildArticleJsonLd(post: { slug: string; title: string; description: string; date: string }) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url,
    mainEntityOfPage: url,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}
