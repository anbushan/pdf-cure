import type { Metadata } from "next";
import { getTool } from "./toolsConfig";

// Update this once you know the real deployment domain — it feeds
// canonical URLs, Open Graph tags, and the sitemap.
export const SITE_URL = "https://pdfcure.app";
export const SITE_NAME = "PDFCure";
export const SITE_TAGLINE = "Quick Fix for Your PDFs";

export function buildToolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  const title = tool ? `${tool.name} — free & private | ${SITE_NAME}` : SITE_NAME;
  const description = tool
    ? `${tool.description} Runs in your browser — no upload, no sign-up, free.`
    : "Free, private PDF tools that run in your browser.";
  const url = `${SITE_URL}/tools/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 512, height: 512 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/** JSON-LD SoftwareApplication schema for a tool page, as a plain object ready to stringify. */
export function buildToolJsonLd(slug: string) {
  const tool = getTool(slug);
  if (!tool) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${tool.name} — ${SITE_NAME}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in a web browser)",
    description: tool.description,
    url: `${SITE_URL}/tools/${slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
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
      images: [{ url: `${SITE_URL}/og-image.png`, width: 512, height: 512 }],
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
