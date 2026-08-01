import { CATEGORIES, TOOLS } from "@/lib/toolsConfig";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";
import HeroText from "@/components/HeroText";
import TrustSection from "@/components/TrustSection";
import HeroBadges from "@/components/HeroBadges";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:pt-24">
        <HeroText />
        <HeroBadges />
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? ""} minHeight={90} className="mb-4" />
      </div>

      {CATEGORIES.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category);
        return (
          <section key={category} id={category.toLowerCase()} className="mx-auto max-w-6xl px-6 py-10 scroll-mt-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{category}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      <TrustSection />
    </div>
  );
}
