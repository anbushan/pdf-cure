import { NextResponse } from "next/server";
import { createScanSession } from "@/lib/scanSession";

export async function POST() {
  const { id, expiresAt } = await createScanSession();
  return NextResponse.json({ id, expiresAt });
}
