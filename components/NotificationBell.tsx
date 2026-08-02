"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "./ToastProvider";

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

const TOASTED_KEY = "foldwork-notif-toasted";

export default function NotificationBell() {
  const { status } = useSession();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        const notifications: NotificationItem[] = data.notifications ?? [];
        setItems(notifications);

        // Surface unread notifications once per browser session right after
        // they're fetched (which happens as soon as someone is signed in) —
        // this is what makes them "arrive" rather than only appear if the
        // person happens to open the bell.
        const alreadyToasted = new Set(JSON.parse(sessionStorage.getItem(TOASTED_KEY) ?? "[]"));
        const unread = notifications.filter((n) => !n.read && !alreadyToasted.has(n.id));
        unread.slice(0, 3).forEach((n) => toast.info(n.title));
        if (unread.length) {
          const updated = [...alreadyToasted, ...unread.map((n) => n.id)];
          sessionStorage.setItem(TOASTED_KEY, JSON.stringify(updated));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch {
      // stays optimistically marked read locally; next full reload reconciles with the server
    }
  }

  if (status !== "authenticated") return null;

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-paper-dim hover:text-ink"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-md border border-paper-line bg-white shadow-card z-50 overflow-hidden">
          <div className="border-b border-paper-line px-4 py-2.5">
            <p className="text-sm font-medium text-ink">Notifications</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-faint">Nothing here yet.</p>
            ) : (
              items.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Sparkles;
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex w-full items-start gap-2.5 border-b border-paper-line px-4 py-3 text-left last:border-0 hover:bg-paper-dim/50 ${
                      n.read ? "" : "bg-paper-dim/30"
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[n.type] ?? TYPE_COLOR.info}`}>
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-ink">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-faint">{n.body}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
