import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `Terms and Conditions | ${SITE_NAME}`,
  description: "The terms that apply to using PDFCure's PDF tools.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

const UPDATED = "July 25, 2026";

export default function TermsPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms and Conditions" }]} />
      <div className="mx-auto max-w-2xl px-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Terms and Conditions</h1>
        <p className="mt-2 text-sm font-mono text-ink-faint">Last updated {UPDATED}</p>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-faint">
          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Using this site</h2>
            <p>
              By using PDFCure, you agree to these terms. If you don't agree, please don't use the site. We may
              update these terms from time to time; continued use after a change means you accept the update.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">What the service is</h2>
            <p>
              PDFCure provides free, browser-based tools for working with PDF files, plus two AI-assisted tools that
              call a third-party language model API. The service is provided "as is," with no guarantee that any
              particular tool will produce a perfect or lossless result — several tool pages explicitly describe
              known limitations (for example, PDF-to-Word text extraction doesn't preserve layout).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Your responsibility for your files</h2>
            <p>
              You're responsible for the files you process here and for having the right to use, edit, and distribute
              them. Don't use this service for content that's illegal, infringes someone else's rights, or that you
              don't have permission to handle.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">No warranty</h2>
            <p>
              We make no warranty that the service will be uninterrupted, error-free, or fit for any particular
              purpose. Tools marked "coming soon" are not available and no timeline is promised for them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use
              of this site, including data loss, business interruption, or reliance on any tool's output — including
              the redaction, signing, and AI tools. Always verify sensitive results (e.g. that redacted content is
              actually removed) before relying on them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Third-party services</h2>
            <p>
              The AI tools rely on Anthropic's Claude API. Advertising, if enabled, relies on Google AdSense. Your use
              of those tools is also subject to those providers' own terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Changes and termination</h2>
            <p>
              We may modify, suspend, or discontinue any part of the service at any time, including individual tools.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Contact</h2>
            <p>
              Questions about these terms? Reach us via the{" "}
              <Link href="/contact" className="text-amber-dark underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
