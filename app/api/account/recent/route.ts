import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const LIMIT_PER_SOURCE = 50;

/**
 * Merges tool completions (UserActivity) and AI tool calls (AiUsage) into
 * one reverse-chronological feed. Fetches a generous slice of each source
 * and merges in memory rather than paginating properly across two tables
 * — "recent activity" for one person's own account is small enough that
 * this is simpler than real cross-source pagination and good enough.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const [activities, aiUsage] = await Promise.all([
    prisma.userActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: LIMIT_PER_SOURCE,
    }),
    prisma.aiUsage.findMany({
      where: { userId: session.user.id },
      orderBy: { usedAt: "desc" },
      take: LIMIT_PER_SOURCE,
    }),
  ]);

  const merged = [
    ...activities.map((a) => ({ id: `tool-${a.id}`, kind: "tool" as const, label: a.tool, createdAt: a.createdAt })),
    ...aiUsage.map((a) => ({ id: `ai-${a.id}`, kind: "ai" as const, label: a.feature, createdAt: a.usedAt })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json({ rows: merged.slice(0, LIMIT_PER_SOURCE) });
}
