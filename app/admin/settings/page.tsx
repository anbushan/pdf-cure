"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SettingRow {
  key: string;
  value: string;
  source: "database" | "env" | "unset";
  isSecret: boolean;
}

const LABELS: Record<string, { label: string; hint: string }> = {
  ANTHROPIC_API_KEY: {
    label: "Anthropic API key",
    hint: "Powers the AI tools (Summarize, Ask your PDF, Translate). Get one at console.anthropic.com.",
  },
  GOOGLE_CLIENT_ID: {
    label: "Google OAuth client ID",
    hint: "Used for Google sign-in and the Google Drive file picker. From Google Cloud Console → Credentials.",
  },
  GOOGLE_CLIENT_SECRET: {
    label: "Google OAuth client secret",
    hint: "Pairs with the client ID above. Changing this signs out every current session, including yours.",
  },
  NEXT_PUBLIC_GOOGLE_API_KEY: {
    label: "Google Drive API key",
    hint: "Lets people import a file straight from Google Drive on every tool. Restrict it to the Picker API.",
  },
  NEXT_PUBLIC_GOOGLE_APP_ID: {
    label: "Google Cloud project number",
    hint: "The numeric project ID shown on your Google Cloud project's dashboard.",
  },
};

function SourceBadge({ source }: { source: SettingRow["source"] }) {
  const styles: Record<string, string> = {
    database: "bg-teal-light text-teal-dark",
    env: "bg-amber-light text-amber-dark",
    unset: "bg-paper-dim text-ink-faint",
  };
  const text: Record<string, string> = { database: "set here", env: "from .env", unset: "not set" };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[source]}`}>{text[source]}</span>;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: SettingRow[]) => setSettings(data))
      .catch(() => setError("Couldn't load settings."));
  }

  useEffect(load, []);

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

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Configuration</h1>
      <p className="mt-1 text-sm text-ink-faint max-w-2xl">
        Overrides the matching environment variable immediately, no redeploy needed. Leave a field blank and save to
        clear the override and fall back to .env.
      </p>

      {error && <p className="mt-4 text-sm text-rust-dark">{error}</p>}

      {!settings ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-ink-faint">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {settings.map((s) => {
            const meta = LABELS[s.key] ?? { label: s.key, hint: "" };
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
                    type={s.isSecret ? "password" : "text"}
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
      )}
    </div>
  );
}
