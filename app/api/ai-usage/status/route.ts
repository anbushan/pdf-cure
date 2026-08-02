import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { getAiUsageStatus } from "@/lib/aiUsage";

export async function GET(req: NextRequest) {
  const feature = req.nextUrl.searchParams.get("feature") ?? "";
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ signedIn: false, available: false });
  }
  const status = await getAiUsageStatus(session.user.id, feature);
  return NextResponse.json({ signedIn: true, ...status });
}
