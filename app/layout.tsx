import type { Metadata, Viewport } from "next";
import { Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import AdSenseScript from "@/components/AdSenseScript";
import AuthProvider from "@/components/AuthProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnalyticsPageview from "@/components/AnalyticsPageview";
import ScrollRestoration from "@/components/ScrollRestoration";
import ErrorTracker from "@/components/ErrorTracker";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import FeedbackButton from "@/components/FeedbackButton";
import { SITE_URL, SITE_NAME, INDEXING_ENABLED } from "@/lib/pageMetadata";
import { ROUTED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/locales";

// Source Sans 3 — the free Google Font Smallpdf's own site uses; clean,
// humanist, and reads a little more approachable than Inter's geometric
// grid, which is the point of matching it.
const sourceSansDisplay = Source_Sans_3({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sourceSansBody = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — free PDF tools that run in your browser`,
  description:
    "Merge, split, compress, sign, and convert PDFs entirely in your browser. Nothing is uploaded to a server. Free, no account needed.",
  keywords: [
    "merge pdf", "split pdf", "combine pdf", "extract pdf", "compress pdf", "convert pdf",
    "word to pdf", "pdf to word", "excel to pdf", "pdf to excel", "powerpoint to pdf", "pdf to powerpoint",
    "pdf to jpg", "jpg to pdf", "pdf converter", "pdf editor", "unlock pdf", "sign pdf",
  ],
  // Off (noindex) until ENABLE_INDEXING=true — see lib/pageMetadata.ts.
  // Every page inherits this unless it sets its own `robots`, which only
  // /admin and the scan-to-pdf mobile page currently do (they stay
  // noindex regardless, on purpose).
  robots: INDEXING_ENABLED ? { index: true, follow: true } : { index: false, follow: false },
  alternates: {
    canonical: SITE_URL,
    languages: {
      [DEFAULT_LOCALE]: SITE_URL,
      ...Object.fromEntries(ROUTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}`])),
      "x-default": SITE_URL,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${SITE_NAME} — free PDF tools that run in your browser`,
    description: "Merge, split, compress, sign, and convert PDFs entirely in your browser. Free, private, no account needed.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — free PDF tools that run in your browser`,
    description: "Merge, split, compress, sign, and convert PDFs entirely in your browser.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
  width: "device-width",
  initialScale: 1,
};

// A single @graph combining both types is the pattern Google's own docs
// use for a site that is both a WebSite and the Organization behind it —
// one script tag instead of two competing root objects.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: "Free, private PDF tools that run entirely in your browser.",
    },
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-full.png`,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deliberately NOT reading the /[locale] segment here via headers()/
  // cookies() — that was tried and reverted: it correctly rendered each
  // locale's <html lang> and body on the server, but because this layout
  // is shared by every route, calling a dynamic API in it forces the
  // *entire site* out of static generation (verified: all ~500 previously
  // static pages, English included, flipped to server-rendered-per-request).
  // That's a bad trade for fixing a secondary flash-of-English on brand
  // new locale pages. LocaleSync (client-side, see components/LocaleSync)
  // corrects the locale post-hydration instead — the metadata (title,
  // description, hreflang), which is what actually drives search results,
  // is already correct pre-hydration via generateMetadata.
  return (
    <html lang="en" suppressHydrationWarning className={`${sourceSansDisplay.variable} ${sourceSansBody.variable} ${mono.variable}`}>
      <head>
        {/* Runs before paint so there's no flash of the wrong theme on load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('foldwork-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body text-ink antialiased min-h-screen flex flex-col">
        <JsonLd data={siteJsonLd} />
        <AdSenseScript />
        <GoogleAnalytics />
        <ErrorTracker />
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <AnalyticsPageview />
                <ScrollRestoration />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <CookieBanner />
                <ScrollToTop />
                <FeedbackButton />
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
