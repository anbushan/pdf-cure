"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 480;

export default function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // The mobile scan-capture page has its own fixed bottom action bar —
  // avoid stacking another fixed control on top of it.
  const suppressed = pathname?.startsWith("/scan/");

  useEffect(() => {
    if (suppressed) return;
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [suppressed]);

  if (suppressed || !visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      title="Scroll to top"
      className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-paper-line bg-paper text-ink-faint shadow-card transition-colors hover:text-ink hover:border-ink-faint/40"
    >
      <ArrowUp size={18} />
    </button>
  );
}
