import {
  getAllProducts,
  getBestSellers,
  getNewArrivals,
} from "@/server/products";
import { getMedia } from "@/server/store";
import { MEDIA_SLOTS, mediaSrc } from "@/lib/media";
import { Hero } from "@/components/home/hero";
import { Testimonials } from "@/components/home/testimonials";
import { TrustBadges } from "@/components/trust-badges";
import { ProductCarousel } from "@/components/carousel";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [all, best, fresh, media] = await Promise.all([
    getAllProducts(),
    getBestSellers(),
    getNewArrivals(),
    getMedia(),
  ]);

  const newSpicePacks = fresh.filter((p) => p.category !== "pickles");
  const spotlight = all.filter((p) => p.isHot).slice(0, 6);
  const bestPickles = best.filter((p) => p.category === "pickles");

  const heroSrc = media["hero-bg"] ? mediaSrc("hero-bg", media) : undefined;
  const tileSrcs = MEDIA_SLOTS.slice(1).map((slot) =>
    media[slot.key] ? mediaSrc(slot.key, media) : undefined,
  );

  return (
    <>
      <Hero heroSrc={heroSrc} tileSrcs={tileSrcs} />

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
            eyebrow="From our customers"
            title="Jars that made it back home"
          />
          <Testimonials />
        </Reveal>
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
