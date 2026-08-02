import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";
import { Prisma } from "@prisma/client";

const SORTABLE = ["order", "name", "priceInr", "createdAt"] as const;
type SortField = (typeof SORTABLE)[number];

export async function GET(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(params.get("pageSize") ?? "20", 10) || 20));
  const sortParam = params.get("sort") ?? "order";
  const sort: SortField = (SORTABLE as readonly string[]).includes(sortParam) ? (sortParam as SortField) : "order";
  const dir: Prisma.SortOrder = params.get("dir") === "desc" ? "desc" : "asc";
  const q = params.get("q")?.trim();
  const active = params.get("active")?.trim();

  const where: Prisma.PlanWhereInput = {
    ...(active ? { active: active === "true" } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.plan.findMany({ where, orderBy: { [sort]: dir }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.plan.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const body = (await req.json()) as {
    name?: string;
    description?: string;
    priceInr?: number;
    dailyAiLimit?: number;
    features?: string[];
    cta?: string;
    order?: number;
    active?: boolean;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Plan name is required." }, { status: 400 });
  }

  const plan = await prisma.plan.create({
    data: {
      name: body.name.trim(),
      description: (body.description ?? "").trim(),
      priceInr: Number.isFinite(body.priceInr) ? Math.max(0, body.priceInr!) : 0,
      dailyAiLimit: Number.isFinite(body.dailyAiLimit) ? Math.max(0, body.dailyAiLimit!) : 0,
      features: JSON.stringify((body.features ?? []).filter((f) => f.trim())),
      cta: ["free", "checkout", "disabled"].includes(body.cta ?? "") ? body.cta! : "disabled",
      order: Number.isFinite(body.order) ? body.order! : 0,
      active: body.active ?? true,
    },
  });

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "plan_created",
    target: plan.id,
    detail: plan.name,
  });

  return NextResponse.json(plan, { status: 201 });
}
