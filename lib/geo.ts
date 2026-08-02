import { currencyForCountry } from "./currency";

// Tiny in-memory cache so a burst of requests from the same visitor (or
// the same NAT'd office/campus IP) doesn't each trigger their own external
// lookup. Not persisted across server restarts — fine for this purpose.
const cache = new Map<string, { country: string | null; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

async function lookupCountry(ip: string): Promise<string | null> {
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.country;

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("geo lookup failed");
    const data = await res.json();
    const country = typeof data.country_code === "string" ? data.country_code : null;
    cache.set(ip, { country, expiresAt: Date.now() + CACHE_TTL_MS });
    return country;
  } catch {
    return null;
  }
}

/**
 * Best-effort "which currency should /pricing show" — IP geolocation for
 * display only. The actual Razorpay charge stays in INR regardless (see
 * lib/currency.ts); this never gates functionality, so a failed/slow
 * lookup just falls back to INR rather than blocking anything.
 */
export async function currencyForIp(ip: string | null): Promise<string> {
  const isPrivateOrLocal = !ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.");
  const country = isPrivateOrLocal ? null : await lookupCountry(ip);
  return currencyForCountry(country);
}
