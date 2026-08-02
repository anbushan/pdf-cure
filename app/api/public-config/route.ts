import { NextResponse } from "next/server";
import { getSettings, PUBLIC_SETTING_KEYS } from "@/lib/settings";

/**
 * Serves the subset of Setting rows that are safe for the browser, so
 * admin-configured values (AdSense/GA IDs, Google Drive picker keys) take
 * effect immediately without a rebuild — process.env.NEXT_PUBLIC_* alone
 * can't do that, since Next.js inlines those at build time.
 */
export async function GET() {
  const config = await getSettings(PUBLIC_SETTING_KEYS);
  return NextResponse.json(config, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
