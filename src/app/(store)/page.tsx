import { Suspense } from "react";
import type { Metadata } from "next";
import { preload } from "react-dom";
import {
  getAllProducts,
  getBestSellers,
  getNewArrivals,
} from "@/server/products";
import { getMedia, getSettings } from "@/server/store";
import { MEDIA_SLOTS, mediaSrc } from "@/lib/media";
import { festivalFor, resolveActiveFestivalId } from "@/lib/festivals";
import { BEEF_STORY_HIDDEN_ON, beefVariants } from "@/lib/beef-story";
import { BeefStory } from "@/components/home/beef-story";
import { Hero } from "@/components/home/hero";
import { Testimonials } from "@/components/home/testimonials";
import { TrustBadges } from "@/components/trust-badges";
import { ProductCarousel } from "@/components/carousel";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/ui/motion";
import { pageMetadata } from "@/lib/seo";
import { HOME_SEO } from "@/lib/seo.config";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata(HOME_SEO, "/");
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const [all, best, fresh, media, settings] = await Promise.all([
    getAllProducts(),
    getBestSellers(),
    getNewArrivals(),
    getMedia(),
    getSettings(),
  ]);

  const newSpicePacks = fresh.filter((p) => p.category !== "pickles");
  const spotlight = all.filter((p) => p.isHot).slice(0, 6);
  const bestPickles = best.filter((p) => p.category === "pickles");

  const heroSrc = media["hero-bg"] ? mediaSrc("hero-bg", media) : undefined;
  const tileSrcs = MEDIA_SLOTS.slice(1).map((slot) =>
    media[slot.key] ? mediaSrc(slot.key, media) : undefined,
  );

  const activeFestivalId = resolveActiveFestivalId(settings.theme);

  // the beef story is non-veg, so it stays off on veg-only festival themes —
  // including the homepage's ?theme= preview, which the hero also honours
  const { theme: preview } = await searchParams;
  const shownTheme = preview && festivalFor(preview) ? preview : activeFestivalId;
  const beef = BEEF_STORY_HIDDEN_ON.includes(shownTheme) ? [] : beefVariants(all);
  if (beef.length) {
    preload("/scroll-story/img/jar-closed.webp", { as: "image", fetchPriority: "high" });
  }

  return (
    <>
      {beef.length > 0 && <BeefStory variants={beef} />}
      <Suspense fallback={null}>
        <Hero
          heroSrc={heroSrc}
          tileSrcs={tileSrcs}
          themeId={activeFestivalId}
          allProducts={all}
        />
      </Suspense>

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
