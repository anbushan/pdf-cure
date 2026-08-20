import { Sparkle, Download, Bell, Gauge } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { getAiUsageSummary } from "@/lib/aiUsage";
import FreeBadge from "@/components/FreeBadge";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AccountDashboardPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [usage, downloadCount, unreadCount] = await Promise.all([
    getAiUsageSummary(userId),
    prisma.userActivity.count({ where: { userId } }),
    prisma.notification.count({ where: { active: true, reads: { none: { userId } } } }),
  ]);

  const isPro = usage.plan === "pro";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-faint">An overview of your plan, AI usage today, and recent activity.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="paper-stack p-4">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-sm ${isPro ? "bg-amber-light text-amber-dark" : "bg-paper-dim text-ink-faint"}`}>
              <Sparkle size={16} />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Plan</p>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">{isPro ? "Pro" : "Free"}</p>
          {isPro && session!.user.planExpiresAt ? (
            <p className="mt-1 text-xs text-ink-faint">Renews {fmtDate(new Date(session!.user.planExpiresAt))}</p>
          ) : !isPro ? (
            <FreeBadge className="mt-1.5" />
          ) : null}
        </div>

        <div className="paper-stack p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-teal-light text-teal-dark">
              <Download size={16} />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Downloads</p>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">{downloadCount}</p>
          <Link href="/account/downloads" className="mt-1 inline-block text-xs font-medium text-ink-faint hover:text-ink">
            View all
          </Link>
        </div>

        <div className="paper-stack p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-violet-light text-violet-dark">
              <Bell size={16} />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Notifications</p>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">{unreadCount}</p>
          <Link href="/account/notifications" className="mt-1 inline-block text-xs font-medium text-ink-faint hover:text-ink">
            {unreadCount > 0 ? "Unread — view now" : "View all"}
          </Link>
        </div>
      </div>

      <div className="mt-6 paper-stack p-5">
        <div className="flex items-center gap-2.5">
          <Gauge size={17} className="text-ink-faint" />
          <h2 className="font-display text-sm font-semibold text-ink">AI usage today</h2>
        </div>

        {usage.plan === "free" ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink">Shared pool (all AI tools)</span>
              <span className="text-ink-faint">
                {usage.freeUsed} of {usage.freeLimit} used
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-dim">
              <div
                className="h-full bg-amber"
                style={{ width: `${usage.freeLimit ? Math.min(100, ((usage.freeUsed ?? 0) / usage.freeLimit) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">Resets daily at midnight UTC.</p>
          </div>
        ) : usage.byFeature.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">No AI tools used yet today.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {usage.byFeature.map((f) => {
              const limit = usage.proLimitPerFeature ?? 20;
              return (
                <div key={f.feature}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">{f.feature}</span>
                    <span className="text-ink-faint">
                      {f.used} of {limit} used
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-dim">
                    <div className="h-full bg-amber" style={{ width: `${Math.min(100, (f.used / limit) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-ink-faint">Each AI tool has its own daily pool on Pro. Resets daily at midnight UTC.</p>
          </div>
        )}
      </div>
    </div>
  );
}
