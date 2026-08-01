import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import FaqPageClient from "./FaqPageClient";

export const metadata: Metadata = {
  title: `Frequently asked questions | ${SITE_NAME}`,
  description: "Answers to common questions about privacy, pricing, file limits, and how PDFCure's browser-based PDF tools work.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: `Frequently asked questions | ${SITE_NAME}`,
    description: "Answers to common questions about privacy, pricing, file limits, and how PDFCure's browser-based PDF tools work.",
    url: `${SITE_URL}/faq`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function FaqPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <FaqPageClient />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} />
      </div>
    </div>
  );
}
