import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const SORTABLE = ["createdAt", "name", "email", "plan"] as const;
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
  const plan = params.get("plan")?.trim();
  const role = params.get("role")?.trim();

  const where: Prisma.UserWhereInput = {
    ...(plan ? { plan } : {}),
    ...(role === "admin" ? { isAdmin: true } : role === "member" ? { isAdmin: false } : {}),
    ...(q
      ? {
          OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
        _count: { select: { aiUsage: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}
