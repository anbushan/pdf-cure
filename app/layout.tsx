import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import AdSenseScript from "@/components/AdSenseScript";
import AuthProvider from "@/components/AuthProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnalyticsPageview from "@/components/AnalyticsPageview";
import ErrorTracker from "@/components/ErrorTracker";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import FeedbackButton from "@/components/FeedbackButton";
import { SITE_URL, SITE_NAME, INDEXING_ENABLED } from "@/lib/pageMetadata";

// Inter — same typeface used on nextjs.org alongside Geist; clean, geometric, excellent legibility
const interDisplay = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const interBody = Inter({
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
    images: [{ url: "/og-image.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — free PDF tools that run in your browser`,
    description: "Merge, split, compress, sign, and convert PDFs entirely in your browser.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#161513" },
  ],
  width: "device-width",
  initialScale: 1,
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Free, private PDF tools that run entirely in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${interDisplay.variable} ${interBody.variable} ${mono.variable}`}>
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
