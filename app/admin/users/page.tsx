"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronLeft, ChevronRight, Loader2, X, ShieldCheck, Sparkle } from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  plan: string;
  planExpiresAt: string | null;
  createdAt: string;
  _count: { aiUsage: number; payments: number };
}

interface UserDetail extends Omit<UserRow, "_count"> {
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  accounts: { provider: string; providerAccountId: string }[];
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    plan: string;
    createdAt: string;
    razorpayPaymentId: string | null;
  }[];
  aiUsageByFeature: { feature: string; count: number }[];
  totalAiUsage: number;
  _count: { sessions: number; payments: number };
}

type SortField = "createdAt" | "name" | "email" | "plan";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "name", label: "User" },
  { field: "createdAt", label: "Joined" },
  { field: "plan", label: "Plan" },
];

const PAGE_SIZE = 20;

function initials(name: string | null, email: string | null) {
  const source = name || email || "?";
  return source.charAt(0).toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function UserDetailPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setDetail(null);
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then(setDetail);
  }, [userId]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-paper-line bg-paper shadow-card">
        <div className="flex items-center justify-between border-b border-paper-line px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">User details</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!detail ? (
          <div className="flex flex-1 items-center justify-center py-16 text-ink-faint">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : (
          <div className="flex-1 space-y-6 px-5 py-5">
            <div className="flex items-center gap-3">
              {detail.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detail.image} alt="" referrerPolicy="no-referrer" className="h-14 w-14 shrink-0 rounded-full" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-semibold text-paper">
                  {initials(detail.name, detail.email)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-base font-semibold text-ink">{detail.name || "—"}</p>
                  {detail.isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-dark">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-ink-faint">{detail.email}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Joined</dt>
                <dd className="mt-0.5 text-ink">{fmtDate(detail.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Plan</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-ink">
                  {detail.plan === "pro" && <Sparkle size={13} className="text-amber-dark" />}
                  {detail.plan === "pro" ? "Pro" : "Free"}
                  {detail.plan === "pro" && detail.planExpiresAt && (
                    <span className="text-xs text-ink-faint">until {fmtDate(detail.planExpiresAt)}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Sign-in method</dt>
                <dd className="mt-0.5 text-ink capitalize">{detail.accounts.map((a) => a.provider).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Sessions</dt>
                <dd className="mt-0.5 text-ink">{detail._count.sessions}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">User ID</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-ink-faint">{detail.id}</dd>
              </div>
              {detail.razorpayCustomerId && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Razorpay customer</dt>
                  <dd className="mt-0.5 truncate font-mono text-xs text-ink-faint">{detail.razorpayCustomerId}</dd>
                </div>
              )}
            </dl>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                AI usage — {detail.totalAiUsage} total
              </h3>
              {detail.aiUsageByFeature.length === 0 ? (
                <p className="mt-2 text-sm text-ink-faint">No AI tool usage yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {detail.aiUsageByFeature.map((row) => (
                    <li key={row.feature} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{row.feature}</span>
                      <span className="text-ink-faint">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Payments — {detail._count.payments} total
              </h3>
              {detail.payments.length === 0 ? (
                <p className="mt-2 text-sm text-ink-faint">No payment history.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {detail.payments.map((p) => (
                    <li key={p.id} className="rounded-md border border-paper-line px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink">
                          {(p.amount / 100).toLocaleString("en-IN", { style: "currency", currency: p.currency })}
                        </span>
                        <span className="text-xs text-ink-faint">{fmtDate(p.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-faint">{p.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [plan, setPlan] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      ...(plan ? { plan } : {}),
      ...(role ? { role } : {}),
    });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page, sort, dir, q, plan, role]);

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
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">User information</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {total} account{total === 1 ? "" : "s"} signed in with Google. AI usage resets daily at midnight UTC.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search name or email…"
            className="w-full rounded-md border border-paper-line bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">Everyone</option>
          <option value="admin">Admins only</option>
          <option value="member">Non-admins only</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-paper-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
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
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">AI actions</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Payments</th>
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
                  {q || plan || role ? "No users match your filters." : "No one has signed in yet."}
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedId(user.id)}
                  className="cursor-pointer border-b border-paper-line last:border-0 align-top hover:bg-paper-dim/50"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" referrerPolicy="no-referrer" className="h-8 w-8 shrink-0 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                          {initials(user.name, user.email)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-medium text-ink">{user.name || "—"}</p>
                          {user.isAdmin && <ShieldCheck size={13} className="shrink-0 text-teal-dark" />}
                        </div>
                        <p className="truncate text-xs text-ink-faint">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{fmtDate(user.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.plan === "pro" ? "bg-amber-light text-amber-dark" : "bg-paper-dim text-ink-faint"
                      }`}
                    >
                      {user.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{user._count.aiUsage}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{user._count.payments}</td>
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

      {selectedId && <UserDetailPanel userId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
