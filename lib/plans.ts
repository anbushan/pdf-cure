import { prisma } from "./prisma";
import { getSetting } from "./settings";
import type { Plan } from "@prisma/client";

export interface PlanView {
  id: string;
  name: string;
  description: string;
  priceInr: number;
  dailyAiLimit: number;
  features: string[];
  cta: "free" | "checkout" | "disabled";
  order: number;
  active: boolean;
}

function toView(plan: Plan): PlanView {
  let features: string[] = [];
  try {
    features = JSON.parse(plan.features);
  } catch {
    features = [];
  }
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceInr: plan.priceInr,
    dailyAiLimit: plan.dailyAiLimit,
    features,
    cta: plan.cta === "free" || plan.cta === "checkout" ? plan.cta : "disabled",
    order: plan.order,
    active: plan.active,
  };
}

/**
 * Seeds the two plans this site has always had — same copy that used to
 * be hardcoded in PricingClient.tsx — the first time the table is empty,
 * so /pricing has something sensible to show before an admin ever visits
 * /admin/plans. Mirrors the "first sign-in becomes admin" self-bootstrap
 * pattern already used in lib/auth.ts.
 */
async function ensureSeeded(): Promise<void> {
  const count = await prisma.plan.count();
  if (count > 0) return;

  const [priceInr, freeLimit, proLimit] = await Promise.all([
    getSetting("PRO_PLAN_PRICE_INR"),
    getSetting("FREE_DAILY_LIMIT"),
    getSetting("PRO_DAILY_LIMIT_PER_FEATURE"),
  ]);

  await prisma.plan.createMany({
    data: [
      {
        name: "Free",
        description: "Forever",
        priceInr: 0,
        dailyAiLimit: parseInt(freeLimit ?? "1", 10),
        features: JSON.stringify([
          "Every editing & conversion tool, unlimited, no account",
          `${freeLimit ?? "1"} AI action per day (shared across all AI tools)`,
          "Google Drive import",
          "Ads shown",
        ]),
        cta: "free",
        order: 0,
      },
      {
        name: "Pro",
        description: "Cancel anytime",
        priceInr: parseInt(priceInr ?? "499", 10),
        dailyAiLimit: parseInt(proLimit ?? "20", 10),
        features: JSON.stringify([
          "Everything in Free",
          `${proLimit ?? "20"} AI actions per day, for each AI tool`,
          "No ads, anywhere on the site",
        ]),
        cta: "checkout",
        order: 1,
        active: false,
      },
    ],
  });
}

/** Active plans, in display order — what /pricing renders. */
export async function getActivePlans(): Promise<PlanView[]> {
  await ensureSeeded();
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return plans.map(toView);
}
