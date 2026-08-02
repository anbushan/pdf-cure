import { prisma } from "./prisma";
import { getSetting } from "./settings";

/** UTC calendar day, e.g. "2026-08-02" — the reset boundary for the daily AI quota. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export type Plan = "free" | "pro";

/** A user's *effective* plan — "pro" only counts while a paid period is still active. */
export function effectivePlan(user: { plan: string; planExpiresAt: Date | null }): Plan {
  if (user.plan === "pro" && user.planExpiresAt && user.planExpiresAt.getTime() > Date.now()) {
    return "pro";
  }
  return "free";
}

export interface AiUsageStatus {
  available: boolean;
  plan: Plan;
  used: number;
  limit: number;
  /** Free plan only — which tool used up the shared daily pool. */
  usedFeature?: string;
}

/**
 * Read-only check — does NOT consume the day's quota. Free accounts share
 * one pool across every AI tool; Pro accounts get a separate pool per tool
 * (see lib/settings.ts: FREE_DAILY_LIMIT / PRO_DAILY_LIMIT_PER_FEATURE).
 */
export async function getAiUsageStatus(userId: string, feature: string): Promise<AiUsageStatus> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });
  const plan = effectivePlan(user);
  const usedOn = today();

  if (plan === "pro") {
    const limit = parseInt((await getSetting("PRO_DAILY_LIMIT_PER_FEATURE")) ?? "20", 10);
    const used = await prisma.aiUsage.count({ where: { userId, usedOn, feature } });
    return { available: used < limit, plan, used, limit };
  }

  const limit = parseInt((await getSetting("FREE_DAILY_LIMIT")) ?? "1", 10);
  const rows = await prisma.aiUsage.findMany({ where: { userId, usedOn }, select: { feature: true } });
  return { available: rows.length < limit, plan, used: rows.length, limit, usedFeature: rows[0]?.feature };
}

/** Call once an AI response has actually been generated, to claim today's quota. */
export async function recordAiUsage(userId: string, feature: string): Promise<void> {
  await prisma.aiUsage.create({ data: { userId, feature, usedOn: today() } });
}
