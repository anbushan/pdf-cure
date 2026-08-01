import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/lib/blogPosts";
import { buildBlogPostMetadata, buildArticleJsonLd } from "@/lib/pageMetadata";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogContent from "@/components/BlogContent";
import AdSlot from "@/components/AdSlot";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return buildBlogPostMetadata(post);
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const jsonLd = buildArticleJsonLd(post);

  return (
    <div className="pb-24">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article className="mx-auto max-w-2xl px-6 pt-4">
        <span className="eyebrow text-amber-dark">{post.category}</span>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight text-ink">{post.title}</h1>
        <p className="mt-3 text-sm font-mono text-ink-faint">
          {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readMinutes} min read
        </p>
        <div className="mt-8">
          <BlogContent blocks={post.content} />
        </div>
      </article>
      <div className="mx-auto max-w-2xl px-6 mt-10">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? ""} minHeight={100} />
      </div>
    </div>
  );
}
