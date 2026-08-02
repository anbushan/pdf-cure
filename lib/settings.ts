import { prisma } from "./prisma";

/**
 * Keys the admin Configuration panel can override. GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET are included here too — once an admin exists (see
 * lib/auth.ts: the first person to ever sign in becomes admin) they can
 * rotate OAuth credentials without a redeploy. They still need a starting
 * value in .env to bootstrap the very first login, since there's no way
 * to reach an admin-only settings UI before anyone can sign in.
 */
export const SETTING_KEYS = [
  "ANTHROPIC_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_GOOGLE_API_KEY",
  "NEXT_PUBLIC_GOOGLE_APP_ID",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

/**
 * Settings whose value is safe to expose to the browser (no secrets) —
 * GOOGLE_CLIENT_ID isn't NEXT_PUBLIC_-prefixed because it's also used
 * server-side for NextAuth, but an OAuth client ID isn't itself secret
 * (only GOOGLE_CLIENT_SECRET is), and the Drive picker needs it client-side.
 */
export const PUBLIC_SETTING_KEYS: SettingKey[] = [
  ...SETTING_KEYS.filter((k) => k.startsWith("NEXT_PUBLIC_")),
  "GOOGLE_CLIENT_ID",
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

/** DB value if set, else the matching env var, else undefined. */
export async function getSetting(key: SettingKey): Promise<string | undefined> {
  const all = await loadAll();
  return all[key] || process.env[key] || undefined;
}

export async function getSettings(keys: SettingKey[]): Promise<Partial<Record<SettingKey, string>>> {
  const all = await loadAll();
  const out: Partial<Record<SettingKey, string>> = {};
  for (const key of keys) {
    out[key] = all[key] || process.env[key] || undefined;
  }
  return out;
}

/** Every key + its current effective value and whether it came from the DB or env, for the admin UI. */
export async function getAllSettingsForAdmin(): Promise<
  { key: SettingKey; value: string; source: "database" | "env" | "unset" }[]
> {
  const all = await loadAll();
  return SETTING_KEYS.map((key) => {
    if (all[key]) return { key, value: all[key]!, source: "database" as const };
    if (process.env[key]) return { key, value: process.env[key]!, source: "env" as const };
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
