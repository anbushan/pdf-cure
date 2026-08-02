import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId: params.id, userId: session.user.id } },
    create: { notificationId: params.id, userId: session.user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
