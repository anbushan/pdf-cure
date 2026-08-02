import { prisma } from "./prisma";

/** UTC calendar day, e.g. "2026-08-02" — the reset boundary for the daily AI quota. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface AiUsageStatus {
  available: boolean;
  usedFeature?: string;
}

/** Read-only check — does NOT consume the day's quota. */
export async function getAiUsageStatus(userId: string): Promise<AiUsageStatus> {
  const existing = await prisma.aiUsage.findUnique({
    where: { userId_usedOn: { userId, usedOn: today() } },
  });
  return existing ? { available: false, usedFeature: existing.feature } : { available: true };
}

/**
 * Atomically claims today's single AI action for this user. Relies on the
 * @@unique([userId, usedOn]) constraint — the insert itself is the lock, so
 * this is safe against two requests racing in at once.
 */
export async function tryConsumeAiUsage(userId: string, feature: string): Promise<AiUsageStatus> {
  try {
    await prisma.aiUsage.create({ data: { userId, feature, usedOn: today() } });
    return { available: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      const existing = await prisma.aiUsage.findUnique({
        where: { userId_usedOn: { userId, usedOn: today() } },
      });
      return { available: false, usedFeature: existing?.feature ?? feature };
    }
    throw e;
  }
}
