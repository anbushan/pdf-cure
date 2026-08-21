import { notFound } from "next/navigation";
import { ROUTED_LOCALES } from "@/lib/i18n/locales";
import LocaleSync from "@/components/LocaleSync";

// Only the curated, routed locale set gets real pages — anything else
// (a typo, or one of the other ~18 locales the client-side switcher
// supports but that has no dedicated URL tree yet) 404s immediately
// rather than falling through to an on-demand render.
export const dynamicParams = false;

export function generateStaticParams() {
  return ROUTED_LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!ROUTED_LOCALES.includes(params.locale)) notFound();

  return (
    <>
      <LocaleSync locale={params.locale} />
      {children}
    </>
  );
}
