import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

/** Active notifications for the signed-in user, newest first, with per-user read state. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ notifications: [] });

  const notifications = await prisma.notification.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { reads: { where: { userId: session.user.id }, select: { readAt: true } } },
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      createdAt: n.createdAt,
      read: n.reads.length > 0,
    })),
  });
}
