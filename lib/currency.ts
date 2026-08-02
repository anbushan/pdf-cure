/**
 * Approximate, hand-maintained INR conversion rates for display purposes
 * only — this is not a live FX feed. The actual Razorpay charge is always
 * in INR regardless of what's displayed here (see /pricing), so an
 * approximate rate is a reasonable trade-off against adding another paid
 * external API dependency just for a price estimate. Revisit periodically;
 * meaningful drift just makes the displayed estimate slightly off, it
 * doesn't affect what anyone is actually charged.
 */
export const CURRENCY_RATES_FROM_INR: Record<string, { rate: number; symbol: string; name: string }> = {
  INR: { rate: 1, symbol: "₹", name: "Indian Rupee" },
  USD: { rate: 0.012, symbol: "$", name: "US Dollar" },
  EUR: { rate: 0.011, symbol: "€", name: "Euro" },
  GBP: { rate: 0.0095, symbol: "£", name: "British Pound" },
  AUD: { rate: 0.018, symbol: "A$", name: "Australian Dollar" },
  CAD: { rate: 0.016, symbol: "C$", name: "Canadian Dollar" },
  SGD: { rate: 0.016, symbol: "S$", name: "Singapore Dollar" },
  AED: { rate: 0.044, symbol: "AED ", name: "UAE Dirham" },
  JPY: { rate: 1.8, symbol: "¥", name: "Japanese Yen" },
  CNY: { rate: 0.086, symbol: "¥", name: "Chinese Yuan" },
};

/** ISO country code → currency code, for countries not already covered by a 1:1 guess. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  AE: "AED",
  JP: "JPY",
  CN: "CNY",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  IE: "EUR",
  PT: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
};

export function currencyForCountry(countryCode: string | null | undefined): string {
  if (!countryCode) return "INR";
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "USD";
}

export function convertFromInr(amountInr: number, currency: string): number {
  const info = CURRENCY_RATES_FROM_INR[currency] ?? CURRENCY_RATES_FROM_INR.USD;
  return amountInr * info.rate;
}

export function formatCurrency(amountInr: number, currency: string): string {
  const info = CURRENCY_RATES_FROM_INR[currency] ?? CURRENCY_RATES_FROM_INR.USD;
  const converted = convertFromInr(amountInr, currency);
  const decimals = currency === "JPY" ? 0 : converted < 10 ? 2 : 0;
  return `${info.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
