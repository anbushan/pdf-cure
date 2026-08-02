import { NextResponse } from "next/server";
import { getActiveScanSession } from "@/lib/scanSession";
import { prisma } from "@/lib/prisma";

/** Lets the mobile page discard a captured page before saving. */
export async function DELETE(_req: Request, { params }: { params: { id: string; imageId: string } }) {
  const session = await getActiveScanSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "This session has expired." }, { status: 404 });
  }
  await prisma.scanImage.deleteMany({ where: { id: params.imageId, sessionId: session.id } });
  return NextResponse.json({ ok: true });
}
