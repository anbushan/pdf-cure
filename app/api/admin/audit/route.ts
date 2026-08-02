import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const SORTABLE = ["createdAt", "action", "actorEmail"] as const;
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
  const action = params.get("action")?.trim();

  const where: Prisma.AuditLogWhereInput = {
    ...(action ? { action } : {}),
    ...(q
      ? {
          OR: [
            { actorEmail: { contains: q } },
            { actorName: { contains: q } },
            { target: { contains: q } },
            { detail: { contains: q } },
          ],
        }
      : {}),
  };

  const [rows, total, actions] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { [sort]: dir }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize, actions: actions.map((a) => a.action) });
}
