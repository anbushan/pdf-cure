"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface FeedbackRow {
  id: string;
  type: string;
  message: string;
  email: string | null;
  page: string | null;
  createdAt: string;
}

type SortField = "createdAt" | "type" | "message" | "email" | "page";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "createdAt", label: "Date" },
  { field: "type", label: "Type" },
  { field: "message", label: "Message" },
  { field: "email", label: "Email" },
  { field: "page", label: "Page" },
];

const PAGE_SIZE = 20;

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Debounce the search box so every keystroke doesn't fire a request.
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(qInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [qInput]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sort,
      dir,
      ...(q ? { q } : {}),
    });
    fetch(`/api/admin/feedback?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page, sort, dir, q]);

  function toggleSort(field: SortField) {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir("desc");
    }
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Feedback</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {total} submission{total === 1 ? "" : "s"} from the feedback widget. Saved here regardless of whether email
        delivery is configured.
      </p>

      <div className="mt-5 relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search message, email, type, page…"
          className="w-full rounded-md border border-paper-line bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-paper-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">
              {COLUMNS.map((col) => (
                <th key={col.field} className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">
                  <button onClick={() => toggleSort(col.field)} className="inline-flex items-center gap-1 hover:text-ink">
                    {col.label}
                    {sort === col.field ? (
                      dir === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-ink-faint">
                  <Loader2 size={16} className="inline animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-ink-faint">
                  {q ? "No feedback matches your search." : "No feedback yet."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-paper-line last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">
                    {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-medium text-ink-faint">{row.type}</span>
                  </td>
                  <td className="px-4 py-2.5 max-w-md text-ink">{row.message}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{row.email || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint font-mono text-xs">{row.page || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
