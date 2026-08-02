import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const SORTABLE = ["createdAt", "type", "message", "email", "page"] as const;
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

  const where: Prisma.FeedbackWhereInput = q
    ? {
        OR: [
          { message: { contains: q } },
          { email: { contains: q } },
          { type: { contains: q } },
          { page: { contains: q } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feedback.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}
