import Link from "next/link";
import { CATEGORIES, TOOLS } from "@/lib/toolsConfig";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";
import HeroText from "@/components/HeroText";
import TrustSection from "@/components/TrustSection";
import HeroBadges from "@/components/HeroBadges";
import HeroDropzone from "@/components/HeroDropzone";
import SignInSection from "@/components/SignInSection";
import { localePath } from "@/lib/i18n/localePath";

/** The homepage body, shared by the unprefixed English "/" and every "/[locale]" homepage. */
export default function HomeContent({ locale = "en" }: { locale?: string }) {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:pt-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <HeroText />
            <HeroBadges />
          </div>
          <HeroDropzone />
        </div>
      </section>

      {CATEGORIES.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category);
        return (
          <section key={category} id={category.toLowerCase()} className="mx-auto max-w-6xl px-6 py-10 scroll-mt-20">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{category}</h2>
              <Link
                href={localePath(locale, `/category/${category.toLowerCase()}`)}
                className="text-sm font-medium text-ink-faint hover:text-ink transition-colors shrink-0"
              >
                See all →
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="mx-auto max-w-6xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? ""} minHeight={90} className="mb-4" />
      </div>

      <TrustSection />

      <SignInSection />
    </div>
  );
}
