import { NextResponse } from "next/server";
import { getActiveScanSession } from "@/lib/scanSession";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getActiveScanSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "This session has expired." }, { status: 404 });
  }
  const imageCount = await prisma.scanImage.count({ where: { sessionId: session.id } });
  if (imageCount === 0) {
    return NextResponse.json({ error: "Scan at least one page first." }, { status: 400 });
  }
  await prisma.scanSession.update({ where: { id: session.id }, data: { status: "completed" } });
  return NextResponse.json({ ok: true });
}
