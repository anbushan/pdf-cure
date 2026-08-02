"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SettingRow {
  key: string;
  value: string;
  source: "database" | "env" | "default" | "unset";
  isSecret: boolean;
}

export interface SettingFieldMeta {
  label: string;
  hint: string;
  type?: "text" | "number";
}

const SOURCE_STYLES: Record<string, string> = {
  database: "bg-teal-light text-teal-dark",
  env: "bg-amber-light text-amber-dark",
  default: "bg-paper-dim text-ink-faint",
  unset: "bg-paper-dim text-ink-faint",
};
const SOURCE_TEXT: Record<string, string> = {
  database: "set here",
  env: "from .env",
  default: "default",
  unset: "not set",
};

function SourceBadge({ source }: { source: SettingRow["source"] }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SOURCE_STYLES[source]}`}>
      {SOURCE_TEXT[source]}
    </span>
  );
}

/**
 * Shared editor for a subset of the admin-configurable Setting rows —
 * used by both /admin/settings (technical credentials) and
 * /admin/pricing (plan price + AI limits), which only differ in which
 * keys they show and how those keys are labeled.
 */
export default function SettingsForm({ keys, labels }: { keys: string[]; labels: Record<string, SettingFieldMeta> }) {
  const [settings, setSettings] = useState<SettingRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`/api/admin/settings?keys=${keys.join(",")}`)
      .then((r) => r.json())
      .then((data: SettingRow[]) => setSettings(data))
      .catch(() => setError("Couldn't load settings."));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [keys.join(",")]);

  async function handleSave(key: string) {
    setSaving(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: drafts[key] ?? "" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed.");
      setSavedKey(key);
      setDrafts((d) => ({ ...d, [key]: "" }));
      load();
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2500);
    } catch (e: any) {
      setError(e?.message ?? "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  if (!settings) {
    return (
      <div className="mt-6 flex items-center gap-2 text-sm text-ink-faint">
        <Loader2 size={15} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-rust-dark">{error}</p>}
      <div className="space-y-4">
        {settings.map((s) => {
          const meta = labels[s.key] ?? { label: s.key, hint: "" };
          return (
            <div key={s.key} className="paper-stack p-5">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={s.key} className="text-sm font-semibold text-ink">
                  {meta.label}
                </label>
                <SourceBadge source={s.source} />
                {savedKey === s.key && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-dark">
                    <CheckCircle2 size={13} /> Saved
                  </span>
                )}
              </div>
              {meta.hint && <p className="mt-1 text-xs text-ink-faint">{meta.hint}</p>}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  id={s.key}
                  type={s.isSecret ? "password" : meta.type === "number" ? "number" : "text"}
                  placeholder={s.value || "Not set"}
                  value={drafts[s.key] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                  className="min-w-0 flex-1 rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <button
                  onClick={() => handleSave(s.key)}
                  disabled={saving === s.key || drafts[s.key] === undefined}
                  className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40 shrink-0"
                >
                  {saving === s.key ? "Saving…" : "Save"}
                </button>
              </div>
              {s.isSecret && s.value && <p className="mt-1.5 text-xs text-ink-faint">Current: {s.value}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
