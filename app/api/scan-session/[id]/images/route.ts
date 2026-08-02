import { NextResponse } from "next/server";
import { getActiveScanSession } from "@/lib/scanSession";
import { prisma } from "@/lib/prisma";

/**
 * Desktop-side fetch of the finished scan, once the mobile page has tapped
 * Save. Deletes the session (cascade-deleting its images) right after a
 * successful read — there's no reason to keep someone's scanned photos on
 * the server a second longer than it takes to hand them back.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getActiveScanSession(params.id);
  if (!session || session.status !== "completed") {
    return NextResponse.json({ error: "This session isn't finished yet." }, { status: 404 });
  }

  const images = await prisma.scanImage.findMany({
    where: { sessionId: session.id },
    orderBy: { order: "asc" },
  });

  const dataUrls = images.map((img) => `data:image/jpeg;base64,${Buffer.from(img.data).toString("base64")}`);

  await prisma.scanSession.delete({ where: { id: session.id } });

  return NextResponse.json({ images: dataUrls });
}
