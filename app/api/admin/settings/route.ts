import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/requireAdmin";
import { getAllSettingsForAdmin, getSetting, setSetting, SETTING_KEYS, type SettingKey } from "@/lib/settings";
import { logAudit } from "@/lib/auditLog";

const SECRET_KEYS: SettingKey[] = ["ANTHROPIC_API_KEY", "GOOGLE_CLIENT_SECRET", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"];

// RAZORPAY_PLAN_ID/RAZORPAY_PLAN_ID_PRICE are written by the app itself
// (lib/razorpay.ts) to cache the current Razorpay Plan — not meant to be
// hand-edited, so neither admin screen exposes them by default.
const INTERNAL_KEYS: SettingKey[] = ["RAZORPAY_PLAN_ID", "RAZORPAY_PLAN_ID_PRICE"];

function mask(value: string) {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••••••${value.slice(-4)}`;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const keysParam = req.nextUrl.searchParams.get("keys");
  const keys = keysParam
    ? (keysParam.split(",").filter((k) => SETTING_KEYS.includes(k as SettingKey)) as SettingKey[])
    : SETTING_KEYS.filter((k) => !INTERNAL_KEYS.includes(k));

  const settings = await getAllSettingsForAdmin(keys);
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
  const typedKey = key as SettingKey;
  const isSecret = SECRET_KEYS.includes(typedKey);
  const oldValue = await getSetting(typedKey);
  const newValue = (value ?? "").trim();
  await setSetting(typedKey, newValue);

  await logAudit({
    actorEmail: admin.session.user.email ?? "unknown",
    actorName: admin.session.user.name,
    action: "setting_updated",
    target: typedKey,
    detail: isSecret
      ? `${oldValue ? "was set" : "was empty"} → ${newValue ? "set" : "cleared"}`
      : `${oldValue || "(empty)"} → ${newValue || "(empty)"}`,
  });

  return NextResponse.json({ ok: true });
}
