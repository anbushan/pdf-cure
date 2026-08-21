"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOLS, getTool } from "@/lib/toolsConfig";
import { TOOL_ICONS } from "./toolIcons";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";
import { localePath } from "@/lib/i18n/localePath";

/** Picks up to `count` other live tools, preferring the same category, to link to. */
function pickRelated(currentSlug: string, count = 4) {
  const current = getTool(currentSlug);
  const others = TOOLS.filter((t) => t.slug !== currentSlug && t.status === "live");
  const sameCategory = others.filter((t) => t.category === current?.category);
  const rest = others.filter((t) => t.category !== current?.category);
  return [...sameCategory, ...rest].slice(0, count);
}

export default function RelatedTools({ slug }: { slug: string }) {
  const { locale } = useLanguage();
  const related = pickRelated(slug);
  if (related.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-3">Related PDF tools</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {related.map((tool) => {
          const Icon = TOOL_ICONS[tool.slug];
          const label = getToolLabel(tool.slug, locale, tool.name, tool.description);
          return (
            <Link
              key={tool.slug}
              href={localePath(locale, `/tools/${tool.slug}`)}
              className="flex items-center gap-3 rounded-md border border-paper-line bg-white px-4 py-3 hover:border-ink-faint/40 transition-colors group"
            >
              {Icon && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-paper-dim text-ink-faint">
                  <Icon size={15} />
                </span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-ink truncate">{label.name}</span>
                <span className="block text-xs text-ink-faint truncate">{label.description}</span>
              </span>
              <ArrowRight size={14} className="shrink-0 text-ink-faint group-hover:translate-x-0.5 transition-transform" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
