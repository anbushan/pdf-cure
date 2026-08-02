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

interface PlanRow {
  id: string;
  name: string;
  description: string;
  priceInr: number;
  dailyAiLimit: number;
  features: string;
  cta: string;
  order: number;
  active: boolean;
}

type SortField = "order" | "name" | "priceInr" | "createdAt";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "order", label: "Order" },
  { field: "name", label: "Name" },
  { field: "priceInr", label: "Price (₹/mo)" },
];

const PAGE_SIZE = 20;

const CTA_LABELS: Record<string, string> = { free: "Free tier", checkout: "Paid checkout", disabled: "Coming soon" };
const CTA_STYLES: Record<string, string> = {
  free: "bg-teal-light text-teal-dark",
  checkout: "bg-amber-light text-amber-dark",
  disabled: "bg-paper-dim text-ink-faint",
};

function parseFeatures(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

interface FormState {
  id: string | null;
  name: string;
  description: string;
  priceInr: string;
  dailyAiLimit: string;
  featuresText: string;
  cta: string;
  order: string;
  active: boolean;
}

function emptyForm(nextOrder: number): FormState {
  return { id: null, name: "", description: "", priceInr: "0", dailyAiLimit: "0", featuresText: "", cta: "disabled", order: String(nextOrder), active: true };
}

function rowToForm(row: PlanRow): FormState {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceInr: String(row.priceInr),
    dailyAiLimit: String(row.dailyAiLimit),
    featuresText: parseFeatures(row.features).join("\n"),
    cta: row.cta,
    order: String(row.order),
    active: row.active,
  };
}

function PlanFormModal({ initial, onClose, onSaved }: { initial: FormState; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  useEffect(() => setMounted(true), []);

  async function save() {
    if (!form.name.trim()) {
      setError("Plan name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(form.id ? `/api/admin/plans/${form.id}` : "/api/admin/plans", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          priceInr: parseInt(form.priceInr, 10) || 0,
          dailyAiLimit: parseInt(form.dailyAiLimit, 10) || 0,
          features: form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
          cta: form.cta,
          order: parseInt(form.order, 10) || 0,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save the plan.");
      toast.success(form.id ? "Plan updated" : "Plan created");
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "Couldn't save the plan.");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4 py-8" onClick={onClose}>
      <div className="max-h-full w-full max-w-lg overflow-y-auto paper-stack p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-ink">{form.id ? "Edit plan" : "New plan"}</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-ink-faint">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Team"
                className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-ink-faint">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-faint">Description (shown under the price)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Cancel anytime"
              className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-ink-faint">Price (₹/month)</label>
              <input
                type="number"
                value={form.priceInr}
                onChange={(e) => setForm((f) => ({ ...f, priceInr: e.target.value }))}
                className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-ink-faint">AI actions / day</label>
              <input
                type="number"
                value={form.dailyAiLimit}
                onChange={(e) => setForm((f) => ({ ...f, dailyAiLimit: e.target.value }))}
                className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-faint">Feature bullets — one per line</label>
            <textarea
              value={form.featuresText}
              onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))}
              rows={5}
              placeholder={"Everything in Free\n20 AI actions per day\nNo ads"}
              className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-ink-faint">Button behavior</label>
              <select
                value={form.cta}
                onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                className="mt-1 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              >
                <option value="free">Free tier (no button)</option>
                <option value="checkout">Paid checkout (Razorpay)</option>
                <option value="disabled">Coming soon (disabled)</option>
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
                Shown on /pricing
              </label>
            </div>
          </div>
          <p className="rounded-md bg-paper-dim px-3 py-2 text-xs leading-relaxed text-ink-faint">
            Only one plan should be "Paid checkout" today — it charges whatever /admin/pricing has set, not the price
            typed here. "AI actions / day" here is display copy only; actual enforcement for Free/Pro still comes
            from /admin/pricing.
          </p>
          {error && <p className="text-xs text-rust-dark">{error}</p>}
          <button
            onClick={save}
            disabled={busy}
            className="w-full rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
          >
            {busy ? "Saving…" : form.id ? "Save changes" : "Create plan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AdminPlansPage() {
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("order");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanRow | null>(null);
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
      ...(active ? { active } : {}),
    });
    fetch(`/api/admin/plans?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, sort, dir, q, active]);

  function toggleSort(field: SortField) {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir("asc");
    }
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/plans/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't delete the plan.");
      toast.success("Plan deleted");
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't delete the plan.");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Plans</h1>
          <p className="mt-1 text-sm text-ink-faint">{total} plan{total === 1 ? "" : "s"} — rendered dynamically on /pricing.</p>
        </div>
        <button
          onClick={() => setFormState(emptyForm(rows.length))}
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
            placeholder="Search name or description…"
            className="w-full rounded-md border border-paper-line bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">Shown + hidden</option>
          <option value="true">Shown only</option>
          <option value="false">Hidden only</option>
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
                      dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Button</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-faint">Status</th>
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
                  {q || active ? "No plans match your filters." : "No plans yet."}
                </td>
              </tr>
            ) : (
              rows.map((plan) => (
                <tr key={plan.id} className="border-b border-paper-line last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{plan.order}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink">{plan.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{plan.description}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">
                    {plan.priceInr === 0 ? "Free" : `₹${plan.priceInr.toLocaleString("en-IN")}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CTA_STYLES[plan.cta] ?? CTA_STYLES.disabled}`}>
                      {CTA_LABELS[plan.cta] ?? plan.cta}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.active ? "bg-teal-light text-teal-dark" : "bg-paper-dim text-ink-faint"}`}>
                      {plan.active ? "Shown" : "Hidden"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFormState(rowToForm(plan))}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-paper-dim hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(plan)}
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
        <PlanFormModal
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
        title="Delete this plan?"
        message={deleteTarget ? `"${deleteTarget.name}" will disappear from /pricing immediately. This can't be undone.` : ""}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
