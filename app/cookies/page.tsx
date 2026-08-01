import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `Cookie Policy | ${SITE_NAME}`,
  description: "What cookies PDFCure uses, and why there are very few of them.",
  alternates: { canonical: `${SITE_URL}/cookies` },
};

const UPDATED = "July 25, 2026";

export default function CookiesPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]} />
      <div className="mx-auto max-w-2xl px-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Cookie Policy</h1>
        <p className="mt-2 text-sm font-mono text-ink-faint">Last updated {UPDATED}</p>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-faint">
          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">The short version</h2>
            <p>
              None of the actual PDF tools use cookies — they don't need to, since nothing is tracked server-side.
              The only cookies on this site, if any, come from advertising (if the site operator has enabled it) and
              from your language preference.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Strictly necessary</h2>
            <p>
              Your chosen display language is stored in your browser's local storage (not a cookie, technically) so
              the site remembers it on your next visit. This never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Advertising cookies</h2>
            <p>
              If Google AdSense is enabled on this deployment, Google and its partners may set cookies to serve ads
              and measure their performance, which can include cookies used for personalized advertising depending on
              your region and consent choices. You can opt out of personalized advertising through{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-dark underline">
                Google's Ad Settings
              </a>{" "}
              or via industry tools like{" "}
              <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-amber-dark underline">
                Your Online Choices
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Managing cookies</h2>
            <p>
              You can block or delete cookies through your browser's settings at any time. Since the core tools on
              this site don't depend on cookies to function, blocking them won't break Merge, Split, Compress, or any
              other editing tool.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Contact</h2>
            <p>
              Questions about this policy? Reach us via the{" "}
              <Link href="/contact" className="text-amber-dark underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
