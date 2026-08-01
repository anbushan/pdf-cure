"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, CATEGORY_TKEY, TOOLS } from "@/lib/toolsConfig";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";

export default function Footer() {
  const { t, locale } = useLanguage();
  const liveTools = TOOLS.filter((t) => t.status === "live");

  return (
    <footer className="border-t border-paper-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Full tool sitemap, grouped by category — every live tool linked by name */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((category) => {
            const tools = liveTools.filter((tool) => tool.category === category);
            if (tools.length === 0) return null;
            return (
              <div key={category}>
                <p className="eyebrow text-ink-faint mb-2.5">{t(CATEGORY_TKEY[category])}</p>
                <ul className="space-y-1.5">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-xs text-ink-faint hover:text-ink transition-colors"
                      >
                        {getToolLabel(tool.slug, locale, tool.name, tool.description).name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-paper-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Image src="/brand/mark.png" alt="PDFCure" width={22} height={21} />
            <div>
              <p className="font-display text-sm font-semibold">
                <span className="text-ink">PDF</span>
                <span className="text-rust">Cure</span>
              </p>
              <p className="text-[10px] text-ink-faint">Quick Fix for Your PDFs</p>
            </div>
          </div>
          <p className="text-sm text-ink-faint max-w-md">{t("footerNote")}</p>
          <p className="eyebrow text-ink-faint">© {new Date().getFullYear()}</p>
        </div>

        <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-paper-line pt-6 text-xs text-ink-faint">
          <Link href="/features" className="hover:text-ink transition-colors">{t("features")}</Link>
          <Link href="/blog" className="hover:text-ink transition-colors">{t("blog")}</Link>
          <Link href="/faq" className="hover:text-ink transition-colors">{t("faq")}</Link>
          <Link href="/contact" className="hover:text-ink transition-colors">{t("contact")}</Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">{t("privacyPolicy")}</Link>
          <Link href="/terms" className="hover:text-ink transition-colors">{t("termsConditions")}</Link>
          <Link href="/cookies" className="hover:text-ink transition-colors">{t("cookiePolicy")}</Link>
        </nav>
      </div>
    </footer>
  );
}
