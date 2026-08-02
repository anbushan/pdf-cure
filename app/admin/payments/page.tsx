"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface PaymentRow {
  id: string;
  razorpayPaymentId: string | null;
  razorpaySubscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  createdAt: string;
  user: { email: string | null; name: string | null };
}

type SortField = "createdAt" | "amount" | "status" | "plan";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "createdAt", label: "Date" },
  { field: "amount", label: "Amount" },
  { field: "status", label: "Status" },
  { field: "plan", label: "Plan" },
];

const STATUS_OPTIONS = ["", "created", "authorized", "captured", "failed", "refunded"];
const PAGE_SIZE = 20;

const STATUS_STYLES: Record<string, string> = {
  captured: "bg-teal-light text-teal-dark",
  authorized: "bg-teal-light text-teal-dark",
  created: "bg-paper-dim text-ink-faint",
  failed: "bg-rust-light text-rust-dark",
  refunded: "bg-amber-light text-amber-dark",
};

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [status, setStatus] = useState("");
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
      ...(status ? { status } : {}),
    });
    fetch(`/api/admin/payments?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page, sort, dir, q, status]);

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
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Payments</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {total} payment event{total === 1 ? "" : "s"} from Razorpay (checkout confirmations and webhook events).
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search email, name, payment/subscription ID…"
            className="w-full rounded-md border border-paper-line bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-paper-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">User</th>
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
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Razorpay IDs</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  <Loader2 size={16} className="inline animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  {q || status ? "No payments match your filters." : "No payments yet."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-paper-line last:border-0 align-top">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink">{row.user.name || "—"}</p>
                    <p className="text-xs text-ink-faint">{row.user.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">
                    {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink">
                    {(row.amount / 100).toLocaleString("en-IN", { style: "currency", currency: row.currency })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status] ?? "bg-paper-dim text-ink-faint"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{row.plan}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">
                    {row.razorpayPaymentId && <p className="truncate max-w-[180px]">{row.razorpayPaymentId}</p>}
                    {row.razorpaySubscriptionId && <p className="truncate max-w-[180px]">{row.razorpaySubscriptionId}</p>}
                  </td>
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
