import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { aiUsage: true } },
      aiUsage: { orderBy: { usedAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">User information</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {users.length} account{users.length === 1 ? "" : "s"} signed in with Google. AI usage resets daily at midnight
        UTC.
      </p>

      <div className="mt-6 space-y-3">
        {users.length === 0 && (
          <div className="paper-stack p-8 text-center text-sm text-ink-faint">No one has signed in yet.</div>
        )}
        {users.map((user) => {
          const lastUsage = user.aiUsage[0];
          return (
            <div key={user.id} className="paper-stack flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-full" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper text-sm font-semibold">
                    {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{user.name || "—"}</p>
                    {user.isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-dark">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-faint">{user.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-faint sm:text-right">
                <div>
                  <p className="font-medium text-ink">Joined</p>
                  <p>{user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="font-medium text-ink">AI actions used</p>
                  <p>{user._count.aiUsage}</p>
                </div>
                <div>
                  <p className="font-medium text-ink">Last AI use</p>
                  <p>{lastUsage ? `${lastUsage.feature} · ${lastUsage.usedOn}` : "Never"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
