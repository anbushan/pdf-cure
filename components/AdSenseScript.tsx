"use client";

import Script from "next/script";

/**
 * Loads the AdSense script once, site-wide — but only if
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID is set. With no env var, this renders
 * nothing and costs nothing: the default install stays 100% ad-free
 * and as fast as the rest of the app.
 */
export default function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const demoMode = process.env.NEXT_PUBLIC_ADS_DEMO_MODE === "true";
  if (!client || demoMode) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6133277610393523`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
