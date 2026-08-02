import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";
import { Prisma } from "@prisma/client";

const SORTABLE = ["createdAt", "title", "type"] as const;
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
  const type = params.get("type")?.trim();
  const active = params.get("active")?.trim();

  const where: Prisma.NotificationWhereInput = {
    ...(type ? { type } : {}),
    ...(active ? { active: active === "true" } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { reads: true } } },
    }),
    prisma.notification.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const { title, body, type } = (await req.json()) as { title?: string; body?: string; type?: string };
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: { title: title.trim(), body: body.trim(), type: type && ["info", "success", "warning"].includes(type) ? type : "info" },
  });

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "notification_created",
    target: notification.id,
    detail: notification.title,
  });

  return NextResponse.json(notification, { status: 201 });
}
