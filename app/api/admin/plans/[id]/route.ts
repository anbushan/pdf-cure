import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const existing = await prisma.plan.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

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

  const plan = await prisma.plan.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description.trim() } : {}),
      ...(body.priceInr !== undefined && Number.isFinite(body.priceInr) ? { priceInr: Math.max(0, body.priceInr) } : {}),
      ...(body.dailyAiLimit !== undefined && Number.isFinite(body.dailyAiLimit) ? { dailyAiLimit: Math.max(0, body.dailyAiLimit) } : {}),
      ...(body.features !== undefined ? { features: JSON.stringify(body.features.filter((f) => f.trim())) } : {}),
      ...(body.cta !== undefined && ["free", "checkout", "disabled"].includes(body.cta) ? { cta: body.cta } : {}),
      ...(body.order !== undefined && Number.isFinite(body.order) ? { order: body.order } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
  });

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "plan_updated",
    target: plan.id,
    detail: plan.name,
  });

  return NextResponse.json(plan);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const existing = await prisma.plan.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  await prisma.plan.delete({ where: { id: params.id } });

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "plan_deleted",
    target: params.id,
    detail: existing.name,
  });

  return NextResponse.json({ ok: true });
}
