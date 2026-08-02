import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const { title, body, type, active } = (await req.json()) as {
    title?: string;
    body?: string;
    type?: string;
    active?: boolean;
  };

  const existing = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Notification not found." }, { status: 404 });

  const notification = await prisma.notification.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(body !== undefined ? { body: body.trim() } : {}),
      ...(type !== undefined && ["info", "success", "warning"].includes(type) ? { type } : {}),
      ...(active !== undefined ? { active } : {}),
    },
  });

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "notification_updated",
    target: notification.id,
    detail: notification.title,
  });

  return NextResponse.json(notification);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const existing = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Notification not found." }, { status: 404 });

  await prisma.notification.delete({ where: { id: params.id } });

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "notification_deleted",
    target: params.id,
    detail: existing.title,
  });

  return NextResponse.json({ ok: true });
}
