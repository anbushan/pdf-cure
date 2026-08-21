"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n/locales";
import { useLanguage } from "./LanguageProvider";
import { trackEvent } from "@/lib/analytics";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-2.5 py-1.5 text-xs font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors"
        aria-label="Change language"
      >
        <Globe size={13} />
        <span className="hidden sm:inline">{current.nativeName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 max-h-80 w-52 overflow-y-auto rounded-md border border-paper-line bg-white shadow-card z-50">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                if (l.code !== locale) trackEvent("language_changed", { locale: l.code, previous_locale: locale });
                setLocale(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-paper-dim transition-colors ${
                l.code === locale ? "text-amber-dark font-medium" : "text-ink"
              }`}
            >
              {l.nativeName}
              {l.nativeName !== l.englishName && <span className="text-[10px] text-ink-faint">{l.englishName}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
