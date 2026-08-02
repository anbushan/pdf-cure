import { NextRequest, NextResponse } from "next/server";
import { currencyForIp } from "@/lib/geo";

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function GET(req: NextRequest) {
  const currency = await currencyForIp(getClientIp(req));
  return NextResponse.json({ currency }, { headers: { "Cache-Control": "private, max-age=3600" } });
}
