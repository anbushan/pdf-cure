"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, RTL_LOCALES } from "@/lib/i18n/locales";
import { getTranslations, TKey } from "@/lib/i18n/translations";

const STORAGE_KEY = "foldwork-locale";

interface LanguageContextValue {
  locale: string;
  setLocale: (code: string) => void;
  t: (key: TKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => getTranslations(DEFAULT_LOCALE)[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  }, [locale]);

  function setLocale(code: string) {
    setLocaleState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }

  const translations = getTranslations(locale);
  const t = (key: TKey) => translations[key];

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
