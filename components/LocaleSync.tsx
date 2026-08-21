"use client";

import { useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

/**
 * Bridges a /{locale}/... URL into the existing client-side language
 * state. LanguageProvider was built around a client-only switcher
 * (localStorage, no URL involved) — this is the one addition that lets a
 * URL-based locale (what search engines and hreflang care about) drive
 * that same state on first load, without changing how the switcher
 * itself works on unprefixed English pages.
 */
export default function LocaleSync({ locale }: { locale: string }) {
  const { locale: current, setLocale } = useLanguage();

  useEffect(() => {
    if (current !== locale) setLocale(locale);
    // Only the URL's locale should ever drive this, once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return null;
}
