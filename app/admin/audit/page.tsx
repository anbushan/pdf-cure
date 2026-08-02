"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface AuditRow {
  id: string;
  actorEmail: string;
  actorName: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  createdAt: string;
}

type SortField = "createdAt" | "action" | "actorEmail";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "createdAt", label: "Date" },
  { field: "actorEmail", label: "Actor" },
  { field: "action", label: "Action" },
];

const PAGE_SIZE = 20;

const ACTION_LABELS: Record<string, string> = {
  setting_updated: "Setting updated",
  admin_login: "Admin login",
  admin_granted: "Admin granted",
  notification_created: "Notification created",
  notification_updated: "Notification updated",
  notification_deleted: "Notification deleted",
  plan_created: "Plan created",
  plan_updated: "Plan updated",
  plan_deleted: "Plan deleted",
};

const ACTION_STYLES: Record<string, string> = {
  setting_updated: "bg-amber-light text-amber-dark",
  admin_login: "bg-teal-light text-teal-dark",
  notification_created: "bg-violet-light text-violet-dark",
  notification_updated: "bg-violet-light text-violet-dark",
  notification_deleted: "bg-rust-light text-rust-dark",
  plan_created: "bg-teal-light text-teal-dark",
  plan_updated: "bg-teal-light text-teal-dark",
  plan_deleted: "bg-rust-light text-rust-dark",
  admin_granted: "bg-violet-light text-violet-dark",
};

export default function AdminAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

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
      ...(action ? { action } : {}),
    });
    fetch(`/api/admin/audit?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
        setActions(data.actions);
      })
      .finally(() => setLoading(false));
  }, [page, sort, dir, q, action]);

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
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Audit logs</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {total} event{total === 1 ? "" : "s"} — configuration changes, admin sign-ins, and admin grants.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search email, name, setting, detail…"
            className="w-full rounded-md border border-paper-line bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] ?? a}
            </option>
          ))}
        </select>
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
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Target</th>
              <th className="px-4 py-2.5 font-medium text-ink-faint">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-faint">
                  <Loader2 size={16} className="inline animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-faint">
                  {q || action ? "No events match your filters." : "No audit events yet."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-paper-line last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">
                    {new Date(row.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink">{row.actorName || "—"}</p>
                    <p className="text-xs text-ink-faint">{row.actorEmail}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_STYLES[row.action] ?? "bg-paper-dim text-ink-faint"}`}>
                      {ACTION_LABELS[row.action] ?? row.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{row.target ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-faint">{row.detail ?? "—"}</td>
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
