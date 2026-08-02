import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { TOOLS } from "@/lib/toolsConfig";

const LIVE_TOOL_SLUGS = new Set(TOOLS.map((t) => t.slug));

/** Paginated "My Downloads" — every tool the signed-in user has completed. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(params.get("pageSize") ?? "20", 10) || 20));

  const [rows, total] = await Promise.all([
    prisma.userActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.userActivity.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}

/** Fired by ResultPanel when a signed-in user finishes a tool. Tool slug + timestamp only — never the file. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { tool } = (await req.json()) as { tool?: string };
  if (!tool || !LIVE_TOOL_SLUGS.has(tool)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
  }

  await prisma.userActivity.create({ data: { userId: session.user.id, tool } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
