"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import QuickSearch from "./QuickSearch";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "./LanguageProvider";

export default function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/account")) return null;

  const navLinks = [
    { href: "/#ai",       label: t("catAI"),       className: "text-violet-dark font-medium hover:text-violet" },
    { href: "/#organize", label: t("catOrganize"), className: "text-ink-faint hover:text-ink" },
    { href: "/#convert",  label: t("catConvert"),  className: "text-ink-faint hover:text-ink" },
    { href: "/#edit",     label: t("catEdit"),     className: "text-ink-faint hover:text-ink" },
    { href: "/#security", label: t("catSecurity"), className: "text-ink-faint hover:text-ink" },
    { href: "/pricing",   label: "Pricing",         className: "text-ink-faint hover:text-ink" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileOpen(false)}>
          <Image
            src="/brand/mark.png"
            alt="PDFCure"
            width={30}
            height={29}
            className="transition-transform group-hover:-rotate-6"
            priority
          />
          <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
            <span className="text-ink">PDF</span>
            <span className="text-rust">Cure</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`text-sm transition-colors ${l.className}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
          <QuickSearch />
          <ThemeToggle />
          <LanguageSwitcher />
          <NotificationBell />
          <AuthButton />

          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md text-ink-faint hover:text-ink hover:bg-paper-dim transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile/tablet drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-paper-line bg-paper">
          <nav className="mx-auto max-w-6xl flex flex-col px-4 py-3 sm:px-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`py-2.5 text-sm transition-colors border-b border-paper-line last:border-0 ${l.className}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
