import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: "How PDFCure handles your files and data — what stays on your device, what's sent to a server, and why.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const UPDATED = "July 25, 2026";

export default function PrivacyPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <div className="mx-auto max-w-2xl px-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm font-mono text-ink-faint">Last updated {UPDATED}</p>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-faint">
          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">The short version</h2>
            <p>
              Most tools on this site process your files entirely in your browser — they are never uploaded to us or
              anyone else. A small number of tools (currently Summarize PDF, Ask your PDF, and Translate PDF) extract text from your
              document in your browser and send that text to our server, which forwards it to Anthropic's Claude API
              to generate a response. Those pages say so explicitly before you use them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Files you upload for editing tools</h2>
            <p>
              Tools like Merge, Split, Compress, Watermark, Sign, Redact, and the rest of the editing toolkit run using
              JavaScript in your browser. The file you select is read into your browser's memory, processed there, and
              offered back to you as a download. It is not transmitted to our servers, stored by us, or seen by us in
              any form.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">The AI tools (Summarize, Ask your PDF, Translate)</h2>
            <p>
              These tools extract the text content of your PDF in your browser, then send that extracted text (not the
              original file) to our server. Our server forwards it to Anthropic's Claude API to generate a summary or
              an answer, and returns the result to you. We do not store this text after the request completes. Refer
              to Anthropic's own privacy policy for how they handle API request content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Contact form and feedback</h2>
            <p>
              If you use the Contact page or the feedback button, the name, email, and message you provide are sent to
              us by email so we can respond. We use this only to reply to you and don't add you to any mailing list
              without asking first.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Cookies and advertising</h2>
            <p>
              We don't use cookies to operate the editing tools themselves. If advertising is enabled on this
              deployment, Google AdSense may set cookies to serve and measure ads — see our{" "}
              <Link href="/cookies" className="text-amber-dark underline">Cookie Policy</Link> for details on what that
              involves and how to opt out.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Analytics</h2>
            <p>
              This deployment does not include analytics tracking by default. If the site operator adds an analytics
              tool, this policy should be updated to reflect what's collected.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Children's privacy</h2>
            <p>This site is not directed at children under 13, and we don't knowingly collect information from them.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-2">Changes to this policy</h2>
            <p>
              If this policy changes, we'll update the date at the top of this page. Continued use of the site after
              a change means you accept the updated policy.
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
