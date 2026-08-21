"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TOOL_ICONS } from "./toolIcons";
import { ToolMeta } from "@/lib/toolsConfig";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";
import { localePath } from "@/lib/i18n/localePath";

export default function ToolHeader({ tool }: { tool: ToolMeta }) {
  const Icon = TOOL_ICONS[tool.slug];
  const { t, locale } = useLanguage();
  const label = getToolLabel(tool.slug, locale, tool.name, tool.description);
  return (
    <div className="mx-auto max-w-3xl px-6 pt-10">
      <Link href={localePath(locale, "/")} className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors">
        <ArrowLeft size={15} /> {t("allTools")}
      </Link>
      <div className="mt-5 flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-ink text-paper">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{label.name}</h1>
          <p className="mt-1 text-base text-ink-faint">{label.description}</p>
        </div>
      </div>
    </div>
  );
}
