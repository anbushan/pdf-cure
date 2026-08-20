"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sparkle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import FreeBadge from "@/components/FreeBadge";

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!session) return null;

  const isPro = session.user.plan === "pro";

  async function handleCancelSubscription() {
    setCancelling(true);
    try {
      const res = await fetch("/api/razorpay/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't cancel.");
      toast.success("Subscription cancelled — you'll keep Pro until the current period ends.");
      await update();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't cancel.");
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't delete your account.");
      await signOut({ callbackUrl: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't delete your account.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-faint">Your plan, subscription, and account.</p>

      <div className="mt-5 paper-stack p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Your plan</h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
            <Sparkle size={14} className={isPro ? "text-amber-dark" : "text-ink-faint"} />
            {isPro ? "Pro plan" : "Free plan"}
          </span>
          {!isPro && <FreeBadge />}
        </div>
        {isPro && session.user.planExpiresAt && (
          <p className="mt-1 text-xs text-ink-faint">
            Renews {new Date(session.user.planExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
        {isPro && (
          <button
            onClick={() => setConfirmingCancel(true)}
            disabled={cancelling}
            className="mt-4 rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-ink-faint hover:text-ink disabled:opacity-40"
          >
            {cancelling ? "Cancelling…" : "Cancel subscription"}
          </button>
        )}
      </div>

      <div className="mt-6 paper-stack border-rust/30 p-5">
        <h2 className="font-display text-sm font-semibold text-rust-dark">Danger zone</h2>
        <p className="mt-1.5 text-sm text-ink-faint">
          Permanently delete your account. This cancels your subscription if any, and removes your sign-in, AI usage
          history, and activity from our records. It can't be undone.
        </p>
        <button
          onClick={() => setConfirmingDelete(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white hover:bg-rust-dark"
        >
          <Trash2 size={15} /> Delete account
        </button>
      </div>

      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel your subscription?"
        message="You'll keep Pro access until the end of the current billing period, then drop to the free plan."
        confirmLabel="Cancel subscription"
        busy={cancelling}
        onConfirm={handleCancelSubscription}
        onCancel={() => setConfirmingCancel(false)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete your account?"
        message="This permanently deletes your account, cancels your subscription if any, and can't be undone."
        confirmLabel="Yes, delete"
        danger
        busy={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
