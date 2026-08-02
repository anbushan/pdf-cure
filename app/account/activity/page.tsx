"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, FileQuestion } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import { TOOL_ICONS } from "@/components/toolIcons";

interface ActivityRow {
  id: string;
  kind: "tool" | "ai";
  label: string;
  createdAt: string;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AccountActivityPage() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);

  useEffect(() => {
    fetch("/api/account/recent")
      .then((r) => r.json())
      .then((data) => setRows(data.rows));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Recent Activity</h1>
      <p className="mt-1 text-sm text-ink-faint">Your last 50 tool runs and AI actions, most recent first.</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-paper-line bg-white">
        {!rows ? (
          <div className="px-4 py-10 text-center text-ink-faint">
            <Loader2 size={16} className="inline animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-ink-faint">No activity yet.</div>
        ) : (
          <ul className="divide-y divide-paper-line">
            {rows.map((row) => {
              const tool = row.kind === "tool" ? getTool(row.label) : null;
              const Icon = row.kind === "ai" ? Sparkles : TOOL_ICONS[row.label] ?? FileQuestion;
              return (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${
                      row.kind === "ai" ? "bg-violet-light text-violet-dark" : "bg-ink text-paper"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {row.kind === "ai" ? `Used ${row.label} (AI)` : tool?.name ?? row.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-faint">{fmtDateTime(row.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
