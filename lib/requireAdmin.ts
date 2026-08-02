import { NextResponse } from "next/server";
import { getSession } from "./getSession";

export async function requireAdminSession() {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return { ok: false as const, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { ok: true as const, session };
}
