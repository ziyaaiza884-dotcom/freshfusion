import {
  getAllProducts,
  getBestSellers,
  getNewArrivals,
} from "@/server/products";
import { Hero } from "@/components/home/hero";
import { SubscribeBanner } from "@/components/home/subscribe-banner";
import { TrustBadges } from "@/components/trust-badges";
import { ProductCarousel } from "@/components/carousel";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [all, best, fresh] = await Promise.all([
    getAllProducts(),
    getBestSellers(),
    getNewArrivals(),
  ]);

  const newSpicePacks = fresh.filter((p) => p.category !== "pickles");
  const spotlight = all.filter((p) => p.isHot).slice(0, 6);
  const bestPickles = best.filter((p) => p.category === "pickles");

  return (
    <>
      <Hero />

      <Section className="py-6">
        <Reveal>
          <TrustBadges />
        </Reveal>
      </Section>

      <Section className="pt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Straight from the jar"
            title="Best-selling pickles"
            action={{ label: "All pickles", href: "/shop?category=pickles" }}
          />
        </Reveal>
        <ProductCarousel products={bestPickles} label="Best-selling pickles" />
      </Section>

      <Section className="pt-20">
        <Reveal>
          <SectionHeading
            eyebrow="Freshly ground"
            title="New spice packs"
            action={{ label: "All spices", href: "/shop?category=spices" }}
          />
        </Reveal>
        <ProductCarousel products={newSpicePacks} label="New spice packs" />
      </Section>

      <Section className="pt-24">
        <SubscribeBanner />
      </Section>

      <Section className="pt-20">
        <Reveal>
          <SectionHeading
            eyebrow="Turn up the heat"
            title="Kitchen favourites with a kick"
            action={{ label: "Shop all", href: "/shop" }}
          />
        </Reveal>
        <ProductCarousel products={spotlight} label="Spicy favourites" />
      </Section>
    </>
  );
}
