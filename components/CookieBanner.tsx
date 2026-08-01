"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "foldwork-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const adsEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) || process.env.NEXT_PUBLIC_ADS_DEMO_MODE === "true";

  useEffect(() => {
    if (!adsEnabled) return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, [adsEnabled]);

  if (!adsEnabled || !visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "acknowledged");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 backdrop-blur px-6 py-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-ink-faint">
          This site uses a small number of cookies for advertising. See our{" "}
          <Link href="/cookies" className="text-amber-dark underline">
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md bg-ink px-4 py-1.5 text-xs font-semibold text-paper hover:bg-ink-soft"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
