"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Loader2, Bell, X } from "lucide-react";

type ToastKind = "success" | "error" | "loading" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => number; // returns an id you can dismiss()
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error: () => {},
  info: () => {},
  loading: () => -1,
  dismiss: () => {},
});

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string, autoDismissMs?: number) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      if (autoDismissMs) {
        setTimeout(() => dismiss(id), autoDismissMs);
      }
      return id;
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message, 4000),
    error: (message) => push("error", message, 6000),
    info: (message) => push("info", message, 5000),
    loading: (message) => push("loading", message),
    dismiss,
  };

  const stack = (
    <div className="fixed bottom-5 inset-x-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-md border px-4 py-2.5 text-sm shadow-card max-w-sm ${
            t.kind === "success"
              ? "bg-teal-light border-teal text-teal-dark"
              : t.kind === "error"
              ? "bg-rust-light border-rust text-rust-dark"
              : t.kind === "info"
              ? "bg-violet-light border-violet text-violet-dark"
              : "bg-white border-paper-line text-ink"
          }`}
        >
          {t.kind === "success" && <CheckCircle2 size={16} className="shrink-0" />}
          {t.kind === "error" && <XCircle size={16} className="shrink-0" />}
          {t.kind === "info" && <Bell size={16} className="shrink-0" />}
          {t.kind === "loading" && <Loader2 size={16} className="shrink-0 animate-spin" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted ? createPortal(stack, document.body) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
