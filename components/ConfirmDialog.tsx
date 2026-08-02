"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Portal-based confirm modal, shared by any action that shouldn't fire on a single accidental click (logout, delete, etc). */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm paper-stack p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger ? "bg-rust-light text-rust-dark" : "bg-amber-light text-amber-dark"
            }`}
          >
            <AlertTriangle size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-ink-faint">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-md border border-paper-line bg-white px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40 ${
              danger ? "bg-rust text-white hover:bg-rust-dark" : "bg-amber text-ink hover:bg-amber-dark"
            }`}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
