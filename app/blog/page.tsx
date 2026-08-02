import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogHeading from "./BlogHeading";
import AdSlot from "@/components/AdSlot";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: "Guides on merging, compressing, and converting PDFs — and honest notes on what actually works client-side versus what needs a server.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: "Guides on merging, compressing, and converting PDFs.",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      <div className="mx-auto max-w-3xl px-6 pt-4">
        <BlogHeading />

        <div className="mt-10 space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="paper-stack block p-6">
              <span className="eyebrow text-amber-dark">{post.category}</span>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">{post.title}</h2>
              <p className="mt-1.5 text-base text-ink-faint leading-relaxed">{post.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-mono text-ink-faint">
                  {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-dark">
                  Read <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} className="mt-10" />
      </div>
    </div>
  );
}
