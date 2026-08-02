import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const SORTABLE = ["createdAt", "amount", "status", "plan"] as const;
type SortField = (typeof SORTABLE)[number];

export async function GET(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(params.get("pageSize") ?? "20", 10) || 20));
  const sortParam = params.get("sort") ?? "createdAt";
  const sort: SortField = (SORTABLE as readonly string[]).includes(sortParam) ? (sortParam as SortField) : "createdAt";
  const dir: Prisma.SortOrder = params.get("dir") === "asc" ? "asc" : "desc";
  const q = params.get("q")?.trim();
  const status = params.get("status")?.trim();

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { razorpayPaymentId: { contains: q, mode: "insensitive" } },
            { razorpaySubscriptionId: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { user: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}
