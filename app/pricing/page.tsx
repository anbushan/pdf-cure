import { headers } from "next/headers";
import { getSettings, PUBLIC_SETTING_KEYS } from "@/lib/settings";
import { currencyForIp } from "@/lib/geo";
import { getActivePlans } from "@/lib/plans";
import PricingClient from "./PricingClient";

export const metadata = {
  title: "Pricing | PDFCure",
};

function getClientIp(): string | null {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip");
}

export default async function PricingPage() {
  const [config, currency, plans] = await Promise.all([
    getSettings(PUBLIC_SETTING_KEYS),
    currencyForIp(getClientIp()),
    getActivePlans(),
  ]);
  return <PricingClient config={config} currency={currency} plans={plans} />;
}
