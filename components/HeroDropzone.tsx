"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FileQuestion, X, ArrowRight, Sparkles } from "lucide-react";
import Dropzone from "./Dropzone";
import { TOOL_ICONS } from "./toolIcons";
import { CATEGORIES, CATEGORY_TKEY } from "@/lib/toolsConfig";
import { suggestToolsForFile } from "@/lib/quickToolMatch";
import { setPendingFile } from "@/lib/pendingFile";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";
import { formatBytes } from "@/lib/download";

/**
 * The homepage's "quick access" widget — drop any file, pick a tool from
 * a modal filtered to what actually accepts that file type
 * (lib/quickToolMatch.ts), and land on that tool's page with the file
 * already loaded (via lib/pendingFile.ts, consumed by Dropzone.tsx on
 * every tool page) — no re-upload needed.
 */
export default function HeroDropzone() {
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t, locale } = useLanguage();

  useEffect(() => setMounted(true), []);

  function close() {
    setDroppedFile(null);
  }

  function pickTool(slug: string) {
    if (droppedFile) setPendingFile(droppedFile);
    close();
    router.push(`/tools/${slug}`);
  }

  const suggestions = droppedFile ? suggestToolsForFile(droppedFile) : [];
  const grouped = CATEGORIES.map((category) => ({
    category,
    tools: suggestions.filter((t) => t.category === category),
  })).filter((g) => g.tools.length > 0);

  const modal = droppedFile && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4 py-8" onClick={close}>
      <div className="flex max-h-full w-full max-w-lg flex-col overflow-hidden paper-stack p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-paper-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-ink">What do you want to do?</h2>
            <p className="mt-0.5 truncate text-xs text-ink-faint">
              {droppedFile.name} · {formatBytes(droppedFile.size)}
            </p>
          </div>
          <button onClick={close} className="shrink-0 text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-3 py-3">
          {grouped.length === 0 ? (
            <div className="px-2 py-8 text-center">
              <FileQuestion className="mx-auto text-ink-faint" size={24} />
              <p className="mt-3 text-sm text-ink-faint">
                We don't have a tool for that file type yet — take a look at everything below.
              </p>
            </div>
          ) : (
            grouped.map(({ category, tools }) => (
              <div key={category} className="mb-3 last:mb-0">
                <p className="eyebrow px-2 py-1.5 text-ink-faint">{t(CATEGORY_TKEY[category])}</p>
                <div className="space-y-0.5">
                  {tools.map((tool) => {
                    const Icon = TOOL_ICONS[tool.slug] ?? FileQuestion;
                    const label = getToolLabel(tool.slug, locale, tool.name, tool.description);
                    return (
                      <button
                        key={tool.slug}
                        onClick={() => pickTool(tool.slug)}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-paper-dim"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-ink text-paper">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{label.name}</span>
                          <span className="block truncate text-xs text-ink-faint">{label.description}</span>
                        </span>
                        <ArrowRight size={14} className="shrink-0 text-ink-faint" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-3 -right-3 hidden rounded-full bg-amber px-3 py-1 text-xs font-semibold text-ink shadow-card sm:flex items-center gap-1">
        <Sparkles size={12} /> Quick access
      </div>
      <Dropzone
        accept=""
        driveMimeTypes="application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/html,text/csv,application/vnd.ms-excel"
        label="Drop any file to get started"
        hint="We'll suggest the right free tool for it"
        onFiles={(files) => setDroppedFile(files[0])}
      />
      {mounted && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
