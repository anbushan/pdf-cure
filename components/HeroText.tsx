"use client";

import { useLanguage } from "./LanguageProvider";

export default function HeroText() {
  const { t } = useLanguage();
  return (
    <>
      <span className="eyebrow text-teal-dark">{t("runsInBrowser")}</span>
      <h1 className="mt-4 max-w-2xl font-display text-5xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
        {t("heroTitle")}
      </h1>
      <p className="mt-5 max-w-xl text-lg text-ink-faint leading-relaxed">{t("heroSubtitle")}</p>
    </>
  );
}
