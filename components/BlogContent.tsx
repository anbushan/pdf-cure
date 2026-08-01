import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentBlock } from "@/lib/blogPosts";

export default function BlogContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="font-display text-2xl font-semibold tracking-tight text-ink pt-4">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="font-display text-xl font-semibold tracking-tight text-ink pt-2">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-base leading-relaxed text-ink-faint">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-faint">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-ink-faint">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "cta":
            return (
              <div key={i} className="paper-stack p-5 flex items-center justify-between gap-4 not-prose">
                <p className="text-sm font-medium text-ink">{block.text}</p>
                <Link
                  href={block.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
                >
                  {block.label} <ArrowRight size={14} />
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
