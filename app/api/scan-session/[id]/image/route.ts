import { NextRequest, NextResponse } from "next/server";
import { getActiveScanSession } from "@/lib/scanSession";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 8 * 1024 * 1024; // generous ceiling; the mobile page resizes/compresses before upload

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getActiveScanSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "This session has expired." }, { status: 404 });
  }
  if (session.status === "completed") {
    return NextResponse.json({ error: "This session is already finished." }, { status: 400 });
  }

  const { dataUrl } = (await req.json()) as { dataUrl?: string };
  const base64 = dataUrl?.split(",")[1];
  if (!base64) {
    return NextResponse.json({ error: "No image data received." }, { status: 400 });
  }

  const bytes = Buffer.from(base64, "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image is empty or too large." }, { status: 400 });
  }

  const order = await prisma.scanImage.count({ where: { sessionId: session.id } });
  const [image] = await prisma.$transaction([
    prisma.scanImage.create({ data: { sessionId: session.id, data: bytes, order } }),
    ...(session.status === "waiting" ? [prisma.scanSession.update({ where: { id: session.id }, data: { status: "connected" } })] : []),
  ]);

  return NextResponse.json({ ok: true, id: image.id, pageNumber: order + 1 });
}
