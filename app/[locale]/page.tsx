import type { Metadata } from "next";
import { ROUTED_LOCALES } from "@/lib/i18n/locales";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import HomeContent from "@/components/HomeContent";

export function generateStaticParams() {
  return ROUTED_LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const url = `${SITE_URL}/${params.locale}`;
  const languages: Record<string, string> = { en: SITE_URL, "x-default": SITE_URL };
  for (const l of ROUTED_LOCALES) languages[l] = `${SITE_URL}/${l}`;

  const title = `${SITE_NAME} — free PDF tools that run in your browser`;
  const description =
    "Merge, split, compress, sign, and convert PDFs entirely in your browser. Nothing is uploaded to a server. Free, no account needed.";

  return {
    title,
    description,
    alternates: { canonical: url, languages },
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

export default function LocaleHome({ params }: { params: { locale: string } }) {
  return <HomeContent locale={params.locale} />;
}
