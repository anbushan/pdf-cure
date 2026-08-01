"use client";

import { RenderedPage } from "@/lib/pdfRender";
import { CheckCircle2, Circle } from "lucide-react";

interface Props {
  pages: RenderedPage[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  loading?: boolean;
}

export default function PageSelectGrid({ pages, selected, onToggle, loading }: Props) {
  if (loading) {
    return <p className="text-sm text-ink-faint py-10 text-center">Rendering pages…</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
      {pages.map((p) => {
        const isSelected = selected.has(p.index);
        return (
          <button
            key={p.index}
            onClick={() => onToggle(p.index)}
            className={`relative rounded-md border-2 overflow-hidden text-left transition-colors ${
              isSelected ? "border-amber" : "border-paper-line hover:border-ink-faint/40"
            }`}
          >
            <img src={p.dataUrl} alt={`Page ${p.index + 1}`} className="w-full block" />
            <div className="absolute bottom-1.5 right-1.5">
              {isSelected ? (
                <CheckCircle2 size={18} className="text-amber-dark fill-white" />
              ) : (
                <Circle size={18} className="text-white drop-shadow" />
              )}
            </div>
            <div className="absolute top-1.5 left-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-mono text-paper">
              {p.index + 1}
            </div>
          </button>
        );
      })}
    </div>
  );
}
