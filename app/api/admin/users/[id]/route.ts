import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      accounts: { select: { provider: true, providerAccountId: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { sessions: true, payments: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const aiUsageByFeature = await prisma.aiUsage.groupBy({
    by: ["feature"],
    where: { userId: user.id },
    _count: { _all: true },
    orderBy: { feature: "asc" },
  });

  const totalAiUsage = aiUsageByFeature.reduce((sum, row) => sum + row._count._all, 0);

  return NextResponse.json({
    ...user,
    aiUsageByFeature: aiUsageByFeature.map((r) => ({ feature: r.feature, count: r._count._all })),
    totalAiUsage,
  });
}
