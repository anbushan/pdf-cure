"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: string;
  /** Reserve this much height before the ad loads so it never causes layout shift. */
  minHeight?: number;
  format?: "auto" | "fluid";
  className?: string;
}

/**
 * A single ad unit. Renders nothing if AdSense isn't configured
 * (see AdSenseScript) — this component is purely opt-in.
 *
 * Set NEXT_PUBLIC_ADS_DEMO_MODE=true to see a realistic placeholder ad
 * in the UI without a real, approved AdSense account — useful for
 * checking layout/spacing locally. Google doesn't offer a way to render
 * real test ads without an approved account, and faking a client ID
 * against their real script would violate AdSense policy, so this
 * renders a clearly-labeled mock instead of a real ad request.
 */
export default function AdSlot({ slot, minHeight = 100, format = "auto", className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const demoMode = process.env.NEXT_PUBLIC_ADS_DEMO_MODE === "true";
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || demoMode || pushed.current) return;
    try {
      // @ts-expect-error - adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script hasn't loaded yet, or was blocked — fail silently.
    }
  }, [client, demoMode]);

  if (demoMode) {
    return (
      <div className={`w-full overflow-hidden ${className}`} style={{ minHeight }}>
        <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-ink-faint/60">Advertisement (demo placeholder)</p>
        <div
          className="flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-paper-line bg-paper-dim text-center"
          style={{ minHeight: minHeight - 20 }}
        >
          <span className="font-display text-sm font-semibold text-ink-faint">Your ad could be here</span>
          <span className="text-xs text-ink-faint/70">slot: {slot || "unset"} · {format}</span>
        </div>
      </div>
    );
  }

  if (!client || !slot) return null;

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ minHeight }} aria-hidden="false">
      <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-ink-faint/60">Advertisement</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
