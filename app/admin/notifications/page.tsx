"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  active: boolean;
  createdAt: string;
  _count: { reads: number };
}

type SortField = "createdAt" | "title" | "type";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "title", label: "Title" },
  { field: "type", label: "Type" },
  { field: "createdAt", label: "Created" },
];

const PAGE_SIZE = 20;

const TYPE_STYLES: Record<string, string> = {
  info: "bg-teal-light text-teal-dark",
  success: "bg-amber-light text-amber-dark",
  warning: "bg-rust-light text-rust-dark",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface FormState {
  id: string | null;
  title: string;
  body: string;
  type: string;
  active: boolean;
}

const EMPTY_FORM: FormState = { id: null, title: "", body: "", type: "info", active: true };

function NotificationFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: FormState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  useEffect(() => setMounted(true), []);

  async function save() {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(form.id ? `/api/admin/notifications/${form.id}` : "/api/admin/notifications", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, body: form.body, type: form.type, active: form.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save the notification.");
      toast.success(form.id ? "Notification updated" : "Notification created");
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "Couldn't save the notification.");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md paper-stack p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-ink">
            {form.id ? "Edit notification" : "New notification"}
          </h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-faint">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. New: Scan to PDF is here"
              className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-faint">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
              placeholder="What do you want signed-in users to know?"
              className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-ink-faint">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-paper-line accent-amber"
                />
                Active
              </label>
            </div>
          </div>
          {error && <p className="text-xs text-rust-dark">{error}</p>}
          <button
            onClick={save}
            disabled={busy}
            className="w-full rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
          >
            {busy ? "Saving…" : form.id ? "Save changes" : "Create notification"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [type, setType] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(qInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [qInput]);

  function load() {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sort,
      dir,
      ...(q ? { q } : {}),
      ...(type ? { type } : {}),
      ...(active ? { active } : {}),
    });
    fetch(`/api/admin/notifications?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, sort, dir, q, type, active]);

  function toggleSort(field: SortField) {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir("desc");
    }
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/notifications/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't delete the notification.");
      toast.success("Notification deleted");
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't delete the notification.");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-ink-faint">
            {total} notification{total === 1 ? "" : "s"} — shown to signed-in users via the bell menu in the header.
          </p>
        </div>
        <button
          onClick={() => setFormState(EMPTY_FORM)}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber-dark"
        >
          <Plus size={15} /> New
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search title or body…"
            className="w-full rounded-md border border-paper-line bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">All types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
        </select>
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">Active + inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
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
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Status</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Reads</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Actions</th>
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
                  {q || type || active ? "No notifications match your filters." : "No notifications yet."}
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr key={n.id} className="border-b border-paper-line last:border-0 align-top">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 max-w-xs truncate text-xs text-ink-faint">{n.body}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_STYLES[n.type] ?? "bg-paper-dim text-ink-faint"}`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{fmtDate(n.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${n.active ? "bg-teal-light text-teal-dark" : "bg-paper-dim text-ink-faint"}`}>
                      {n.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{n._count.reads}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFormState({ id: n.id, title: n.title, body: n.body, type: n.type, active: n.active })}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-paper-dim hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(n)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-rust-dark hover:bg-rust-light"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

      {formState && (
        <NotificationFormModal
          initial={formState}
          onClose={() => setFormState(null)}
          onSaved={() => {
            setFormState(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this notification?"
        message={deleteTarget ? `"${deleteTarget.title}" will be removed for everyone. This can't be undone.` : ""}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
