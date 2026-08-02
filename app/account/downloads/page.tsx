"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, FileQuestion } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import { TOOL_ICONS } from "@/components/toolIcons";

interface ActivityRow {
  id: string;
  tool: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AccountDownloadsPage() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/account/activity?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">My Downloads</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {total} tool{total === 1 ? "" : "s"} run while signed in. We only keep the tool name and time — never the file itself.
      </p>

      <div className="mt-5 overflow-hidden rounded-lg border border-paper-line bg-white">
        {loading ? (
          <div className="px-4 py-10 text-center text-ink-faint">
            <Loader2 size={16} className="inline animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-ink-faint">
            Nothing yet — tools you run while signed in will show up here.
          </div>
        ) : (
          <ul className="divide-y divide-paper-line">
            {rows.map((row) => {
              const tool = getTool(row.tool);
              const Icon = TOOL_ICONS[row.tool] ?? FileQuestion;
              return (
                <li key={row.id}>
                  <Link
                    href={tool ? `/tools/${tool.slug}` : "#"}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-dim/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-ink text-paper">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{tool?.name ?? row.tool}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-faint">{fmtDateTime(row.createdAt)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-faint">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-md border border-paper-line px-3 py-1.5 hover:text-ink disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-md border border-paper-line px-3 py-1.5 hover:text-ink disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
