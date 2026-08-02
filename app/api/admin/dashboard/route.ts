import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

const DAYS = 30;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DAYS);

  const [totalUsers, proUsers, adminCount, recentUsers, capturedPayments, recentPayments, totalAiUsage, todayAiUsage] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: "pro", planExpiresAt: { gt: new Date() } } }),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.payment.findMany({ where: { status: "captured" }, select: { amount: true } }),
      prisma.payment.findMany({
        where: { status: "captured", createdAt: { gte: since } },
        select: { amount: true, createdAt: true },
      }),
      prisma.aiUsage.count(),
      prisma.aiUsage.count({ where: { usedOn: dayKey(new Date()) } }),
    ]);

  const days = lastNDays(DAYS);
  const signupsByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const u of recentUsers) {
    const k = dayKey(u.createdAt);
    if (k in signupsByDay) signupsByDay[k]++;
  }

  const revenueByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const p of recentPayments) {
    const k = dayKey(p.createdAt);
    if (k in revenueByDay) revenueByDay[k] += p.amount / 100;
  }

  const totalRevenue = capturedPayments.reduce((sum, p) => sum + p.amount, 0) / 100;

  return NextResponse.json({
    totalUsers,
    proUsers,
    freeUsers: totalUsers - proUsers,
    adminCount,
    totalRevenue,
    totalAiUsage,
    todayAiUsage,
    signups: days.map((d) => ({ day: d, count: signupsByDay[d] })),
    revenue: days.map((d) => ({ day: d, amount: revenueByDay[d] })),
  });
}
