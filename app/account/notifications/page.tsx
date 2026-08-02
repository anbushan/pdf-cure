"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  read: boolean;
}

const TYPE_ICON: Record<string, any> = { info: Sparkles, success: CheckCircle2, warning: AlertTriangle };
const TYPE_COLOR: Record<string, string> = {
  info: "text-teal-dark bg-teal-light",
  success: "text-amber-dark bg-amber-light",
  warning: "text-rust-dark bg-rust-light",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AccountNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setItems(data.notifications ?? []));
  }

  useEffect(load, []);

  async function openDetail(n: NotificationItem) {
    setSelected(n);
    if (!n.read) {
      setItems((prev) => prev?.map((it) => (it.id === n.id ? { ...it, read: true } : it)) ?? prev);
      try {
        await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
      } catch {
        // stays optimistically marked read locally
      }
    }
  }

  const modal = selected && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4" onClick={() => setSelected(null)}>
      <div className="w-full max-w-sm paper-stack p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[selected.type] ?? TYPE_COLOR.info}`}>
              {(() => {
                const Icon = TYPE_ICON[selected.type] ?? Sparkles;
                return <Icon size={16} />;
              })()}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-ink">{selected.title}</h2>
              <p className="mt-0.5 text-xs text-ink-faint">{fmtDateTime(selected.createdAt)}</p>
            </div>
          </div>
          <button onClick={() => setSelected(null)} className="shrink-0 text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink">{selected.body}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Notifications</h1>
      <p className="mt-1 text-sm text-ink-faint">Announcements from the PDFCure team. Tap one for the full message.</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-paper-line bg-white">
        {!items ? (
          <div className="px-4 py-10 text-center text-ink-faint">
            <Loader2 size={16} className="inline animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-ink-faint">Nothing here yet.</div>
        ) : (
          <ul className="divide-y divide-paper-line">
            {items.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Sparkles;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => openDetail(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-paper-dim/50 ${n.read ? "" : "bg-paper-dim/30"}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[n.type] ?? TYPE_COLOR.info}`}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-ink">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-faint">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-faint">{fmtDateTime(n.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
