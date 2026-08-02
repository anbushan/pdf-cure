import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { getAllSettingsForAdmin, setSetting, SETTING_KEYS, type SettingKey } from "@/lib/settings";

const SECRET_KEYS: SettingKey[] = ["ANTHROPIC_API_KEY", "GOOGLE_CLIENT_SECRET"];

function mask(value: string) {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••••••${value.slice(-4)}`;
}

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const settings = await getAllSettingsForAdmin();
  return NextResponse.json(
    settings.map((s) => ({
      ...s,
      isSecret: SECRET_KEYS.includes(s.key),
      value: SECRET_KEYS.includes(s.key) && s.value ? mask(s.value) : s.value,
    }))
  );
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const { key, value } = (await req.json()) as { key?: string; value?: string };
  if (!key || !SETTING_KEYS.includes(key as SettingKey)) {
    return NextResponse.json({ error: "Unknown setting key." }, { status: 400 });
  }
  await setSetting(key as SettingKey, (value ?? "").trim());
  return NextResponse.json({ ok: true });
}
