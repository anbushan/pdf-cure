import { prisma } from "./prisma";

/**
 * Keys the admin panel can override. GOOGLE_CLIENT_ID/SECRET and the
 * Razorpay keys are included here too — once an admin exists (see
 * lib/auth.ts: the first person to ever sign in becomes admin) they can
 * rotate credentials without a redeploy. They still need a starting value
 * in .env to bootstrap the very first login, since there's no way to reach
 * an admin-only settings UI before anyone can sign in.
 *
 * PRO_PLAN_PRICE_INR / FREE_DAILY_LIMIT / PRO_DAILY_LIMIT_PER_FEATURE have
 * no env-var equivalent — they're pure business config, edited from
 * /admin/pricing, with built-in defaults (see DEFAULT_VALUES) so the app
 * works sensibly before an admin ever touches that screen.
 *
 * RAZORPAY_PLAN_ID / RAZORPAY_PLAN_ID_PRICE are written by the app itself
 * (lib/razorpay.ts), not edited directly in either admin form — they cache
 * the Razorpay Plan created for the current price, recreated when the
 * price changes since Razorpay plans are immutable once created.
 */
export const SETTING_KEYS = [
  "ANTHROPIC_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_GOOGLE_API_KEY",
  "NEXT_PUBLIC_GOOGLE_APP_ID",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RAZORPAY_PLAN_ID",
  "RAZORPAY_PLAN_ID_PRICE",
  "PRO_PLAN_PRICE_INR",
  "FREE_DAILY_LIMIT",
  "PRO_DAILY_LIMIT_PER_FEATURE",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

/** Business-config keys with no natural env-var source — see the module comment. */
const DEFAULT_VALUES: Partial<Record<SettingKey, string>> = {
  PRO_PLAN_PRICE_INR: "499",
  FREE_DAILY_LIMIT: "1",
  PRO_DAILY_LIMIT_PER_FEATURE: "20",
};

/**
 * Settings whose value is safe to expose to the browser (no secrets) —
 * GOOGLE_CLIENT_ID and RAZORPAY_KEY_ID aren't NEXT_PUBLIC_-prefixed
 * because they're also read server-side, but neither is itself secret
 * (only *_SECRET values are): GOOGLE_CLIENT_ID is used client-side for the
 * Drive picker, RAZORPAY_KEY_ID is required client-side to open Checkout.
 */
export const PUBLIC_SETTING_KEYS: SettingKey[] = [
  ...SETTING_KEYS.filter((k) => k.startsWith("NEXT_PUBLIC_")),
  "GOOGLE_CLIENT_ID",
  "RAZORPAY_KEY_ID",
  "PRO_PLAN_PRICE_INR",
  "PRO_DAILY_LIMIT_PER_FEATURE",
  "FREE_DAILY_LIMIT",
];

let cache: Partial<Record<SettingKey, string>> | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 10_000;

async function loadAll(): Promise<Partial<Record<SettingKey, string>>> {
  if (cache && Date.now() - cachedAt < CACHE_TTL_MS) return cache;
  const rows = await prisma.setting.findMany();
  cache = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<Record<SettingKey, string>>;
  cachedAt = Date.now();
  return cache;
}

export function invalidateSettingsCache() {
  cache = null;
}

/**
 * Env fallback for a key, including a couple of aliases for values that
 * used to live under a different name before the admin-settings system
 * existed — GOOGLE_CLIENT_ID in particular used to only be needed
 * client-side (for the Drive picker) so it was NEXT_PUBLIC_-prefixed;
 * NextAuth now also needs it server-side under the bare name.
 */
function envValue(key: SettingKey): string | undefined {
  if (process.env[key]) return process.env[key];
  if (key === "GOOGLE_CLIENT_ID") return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined;
  return undefined;
}

function resolve(all: Partial<Record<SettingKey, string>>, key: SettingKey): string | undefined {
  return all[key] || envValue(key) || DEFAULT_VALUES[key] || undefined;
}

/** DB value if set, else the matching env var, else a built-in default, else undefined. */
export async function getSetting(key: SettingKey): Promise<string | undefined> {
  const all = await loadAll();
  return resolve(all, key);
}

export async function getSettings(keys: SettingKey[]): Promise<Partial<Record<SettingKey, string>>> {
  const all = await loadAll();
  const out: Partial<Record<SettingKey, string>> = {};
  for (const key of keys) {
    out[key] = resolve(all, key);
  }
  return out;
}

/** Every key + its current effective value and whether it came from the DB, env, or a built-in default. */
export async function getAllSettingsForAdmin(
  keys: SettingKey[] = [...SETTING_KEYS]
): Promise<{ key: SettingKey; value: string; source: "database" | "env" | "default" | "unset" }[]> {
  const all = await loadAll();
  return keys.map((key) => {
    if (all[key]) return { key, value: all[key]!, source: "database" as const };
    const env = envValue(key);
    if (env) return { key, value: env, source: "env" as const };
    const def = DEFAULT_VALUES[key];
    if (def) return { key, value: def, source: "default" as const };
    return { key, value: "", source: "unset" as const };
  });
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  if (value) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  } else {
    await prisma.setting.deleteMany({ where: { key } });
  }
  invalidateSettingsCache();
}
