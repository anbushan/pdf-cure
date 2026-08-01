import { NextResponse } from "next/server";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID; // e.g. "ca-pub-1234567890123456"
  const pubId = client?.replace("ca-pub-", "pub-");
  const body = pubId ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n` : "";
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}
