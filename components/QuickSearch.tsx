"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, FileQuestion, CornerDownLeft } from "lucide-react";
import { TOOLS } from "@/lib/toolsConfig";
import { TOOL_ICONS } from "./toolIcons";
import { useLanguage } from "./LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";

const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");

export default function QuickSearch() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const labeled = LIVE_TOOLS.map((tool) => ({ tool, label: getToolLabel(tool.slug, locale, tool.name, tool.description) }));
    if (!q) return labeled.slice(0, 8);
    return labeled
      .filter(
        ({ tool, label }) =>
          label.name.toLowerCase().includes(q) ||
          label.description.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q) ||
          tool.slug.includes(q)
      )
      .slice(0, 8);
  }, [query, locale]);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function go(slug: string) {
    router.push(`/tools/${slug}`);
    close();
  }

  // Cmd/Ctrl+K opens the palette from anywhere; Esc closes it.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(id);
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIndex];
      if (hit) go(hit.tool.slug);
    }
  }

  const modal = open && (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 px-4 pt-24 sm:pt-32" onClick={close}>
      <div className="w-full max-w-lg paper-stack overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-paper-line px-4 py-3">
          <Search size={16} className="shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search tools — merge, compress, sign…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-paper-line px-1.5 py-0.5 text-[10px] font-medium text-ink-faint sm:inline">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-faint">No tools match &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map(({ tool, label }, i) => {
              const Icon = TOOL_ICONS[tool.slug] ?? FileQuestion;
              return (
                <button
                  key={tool.slug}
                  onClick={() => go(tool.slug)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-paper-dim" : ""
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-ink text-paper">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{label.name}</span>
                    <span className="block truncate text-xs text-ink-faint">{label.description}</span>
                  </span>
                  {i === activeIndex && <CornerDownLeft size={13} className="shrink-0 text-ink-faint" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search tools"
        title="Search tools (Ctrl+K)"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-paper-dim transition-colors"
      >
        <Search size={17} />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
