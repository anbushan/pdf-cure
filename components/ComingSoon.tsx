"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { ToolMeta } from "@/lib/toolsConfig";

export default function ComingSoon({ tool }: { tool: ToolMeta }) {
  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        <div className="paper-stack p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-light text-amber-dark">
            <Clock size={22} />
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold text-ink">Coming back soon</h3>
          <p className="mt-2 text-sm text-ink-faint">
            {tool.soonReason ?? "This tool is temporarily unavailable while we work on it."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
          >
            Browse other tools
          </Link>
        </div>
      </div>
    </div>
  );
}
