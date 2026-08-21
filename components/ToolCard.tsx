"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { ToolMeta } from "@/lib/toolsConfig";
import { TOOL_ICONS } from "./toolIcons";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";
import { localePath } from "@/lib/i18n/localePath";

const accentMap = {
  amber: { bg: "bg-amber-light", text: "text-amber-dark" },
  teal: { bg: "bg-teal-light", text: "text-teal-dark" },
  rust: { bg: "bg-rust-light", text: "text-rust-dark" },
  violet: { bg: "bg-violet-light", text: "text-violet-dark" },
  green: { bg: "bg-green-light", text: "text-green-dark" },
  orange: { bg: "bg-orange-light", text: "text-orange-dark" },
};

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  const { locale } = useLanguage();
  const Icon = TOOL_ICONS[tool.slug] ?? FileQuestion;
  const accent = accentMap[tool.accent];
  const isLive = tool.status === "live";
  const label = getToolLabel(tool.slug, locale, tool.name, tool.description);

  const card = (
    <div className="paper-stack p-5 h-full flex flex-col gap-3 cursor-pointer">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-sm ${accent.bg} ${accent.text}`}>
          <Icon size={19} strokeWidth={2} />
        </span>
        {!isLive && (
          <span
            className="eyebrow rounded-full border border-ink-faint/30 px-2 py-1 text-ink-faint"
            title={tool.soonReason}
          >
            soon
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-[0.9375rem] font-semibold leading-snug text-ink">{label.name}</h3>
        <p className="mt-1.5 text-sm text-ink-faint leading-snug">{label.description}</p>
      </div>
    </div>
  );

  if (!isLive) {
    return <div className="opacity-70">{card}</div>;
  }

  return (
    <Link href={localePath(locale, `/tools/${tool.slug}`)} className="block h-full">
      {card}
    </Link>
  );
}
