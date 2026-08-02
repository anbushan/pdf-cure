import { NextResponse } from "next/server";
import { getActiveScanSession } from "@/lib/scanSession";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getActiveScanSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "This session has expired." }, { status: 404 });
  }
  if (session.status === "waiting") {
    await prisma.scanSession.update({ where: { id: session.id }, data: { status: "connected" } });
  }
  return NextResponse.json({ ok: true });
}
