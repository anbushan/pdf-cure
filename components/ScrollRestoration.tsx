"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "foldwork-scroll-positions";

function readMap(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, number>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // sessionStorage can throw in private-browsing edge cases — losing
    // scroll restoration isn't worth surfacing an error for.
  }
}

// Module-level state, deliberately set up outside any component/effect
// lifecycle. useSearchParams() requires the Suspense boundary below, and
// that boundary remounts its child on navigation rather than just
// re-rendering it — a popstate listener attached inside a useEffect gets
// torn down and reattached right around the same moment popstate itself
// fires, so by the time the new instance's effect runs, it can miss the
// event it needed to see (verified with Playwright: logging showed the
// restore effect reading `false` a tick before the listener even logged
// "fired"). Attaching the listener once, at module evaluation time —
// which happens exactly once per real page load, not per React mount —
// sidesteps that race entirely.
let wasPopNavigation = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    wasPopNavigation = true;
  });
}

/**
 * Fixes a real, verified browser bug: the browser's own native scroll
 * restoration on back/forward fires as soon as `popstate` does, using
 * whatever height the page happens to have *right then* — which, on a
 * client-rendered Next.js page still hydrating, can be much shorter than
 * its final height. The browser clamps the scroll target to that
 * shorter height and never retries once the rest of the content loads
 * in, so a deep scroll position gets stuck near the top forever.
 *
 * The fix has two parts:
 *  1. Capture the scroll position at the exact moment a same-app link is
 *     clicked (a capture-phase listener, so it runs before Next's router
 *     does anything) rather than trusting "whatever the last scroll
 *     event said" — this site has async content (ad slots, lazily
 *     rendered PDF thumbnails) that can shift layout during the
 *     transition itself and cause a stray scroll event with a
 *     meaningless position right as the old page unmounts.
 *  2. On a back/forward return, retry scrolling until the document has
 *     actually grown tall enough to reach the saved position, instead of
 *     clamping once and getting stuck.
 */
function ScrollRestorationInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // The moment of an in-app link click is the one point guaranteed to
  // still reflect this page's own scroll position, before Next's router
  // or any async content on the page can shift it. Capture phase so it
  // runs before the click reaches the <a> and starts the navigation.
  useEffect(() => {
    function onClickCapture(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const map = readMap();
      map[keyRef.current] = window.scrollY;
      writeMap(map);
    }
    window.addEventListener("click", onClickCapture, { capture: true });
    return () => window.removeEventListener("click", onClickCapture, { capture: true });
  }, []);

  // Deliberately no continuous scroll-event fallback here: it would
  // fire again after the click-capture above (during the transition
  // itself, before this effect's `key` closure updates to the new page)
  // and overwrite the correct just-captured value with whatever async
  // content on the page happened to scroll it to in the meantime — that
  // was an earlier version of this exact bug. Non-click navigations
  // (typing a URL, tab close) simply don't get a saved position, which
  // is an acceptable gap given how few of those exist in this app.

  // On arriving at a page: restore its saved position if this was a
  // back/forward navigation, otherwise start at the top like a normal
  // fresh visit (clicking a new link shouldn't inherit a stale scroll).
  useEffect(() => {
    const saved = readMap()[key];
    const isRestore = wasPopNavigation && saved !== undefined;
    wasPopNavigation = false;

    if (!isRestore) {
      window.scrollTo(0, 0);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    function tryRestore() {
      if (cancelled) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= saved || attempts > 40) {
        window.scrollTo(0, saved);
        return;
      }
      attempts++;
      requestAnimationFrame(tryRestore);
    }
    tryRestore();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return null;
}

export default function ScrollRestoration() {
  return (
    <Suspense fallback={null}>
      <ScrollRestorationInner />
    </Suspense>
  );
}
