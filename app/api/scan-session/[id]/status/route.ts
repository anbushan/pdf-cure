import { NextResponse } from "next/server";
import { getActiveScanSession } from "@/lib/scanSession";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getActiveScanSession(params.id);
  if (!session) {
    return NextResponse.json({ status: "expired", imageCount: 0 });
  }
  const imageCount = await prisma.scanImage.count({ where: { sessionId: session.id } });
  return NextResponse.json({ status: session.status, imageCount });
}
