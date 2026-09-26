"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { easeOutExpo } from "@/components/ui/motion";
import { ProductArt } from "@/components/product-art";
import { MEDIA_SLOTS } from "@/lib/media";
import {
  DEFAULT_FESTIVAL,
  festivalFor,
  heroAccentVar,
  type FestivalConfig,
} from "@/lib/festivals";
import { FestiveScene } from "@/components/home/festive-scene";
import { useProductPhoto } from "@/context/product-photos-context";
import type { Category, Product } from "@/data/types";

const HERO_DEFAULT = MEDIA_SLOTS[0].default;

const chips = [
  { label: "All pickles", href: "/shop?category=pickles" },
  { label: "All spices", href: "/shop?category=spices" },
  { label: "Specialty", href: "/shop?category=specialty" },
];

/** the bundled default collage — shown when no festival featured-products
 *  are configured (the "everyday" theme, or a festival without any set) */
const DEFAULT_JARS: {
  art: string;
  category: Category;
  photo: string;
  alt: string;
}[] = [
  {
    art: "from-[#5b2b1e] to-[#8c3d21]",
    category: "pickles",
    photo: "/images/4suares/pickle.png",
    alt: "Fresh Fusion beef pickle jar",
  },
  {
    art: "from-[#c9a227] to-[#e6c84f]",
    category: "spices",
    photo: "/images/4suares/spices-grid-2.jpg",
    alt: "Whole Kerala spices — pepper, cardamom, cloves and cinnamon",
  },
  {
    art: "from-[#3f6b4c] to-[#7aa85f]",
    category: "specialty",
    photo: "/images/4suares/nuts-grid.jpg",
    alt: "Cashews, raisins, dates and home-made chutneys",
  },
  {
    art: "from-[#8a3d1f] to-[#c25f2c]",
    category: "pickles",
    photo: "/images/4suares/pickle-grid.jpg",
    alt: "Fresh Fusion pickle jars — garlic, mango, fish, lemon, baby mango and veg mix",
  },
];

function isFestivalId(id: string | null): id is string {
  return Boolean(id && festivalFor(id));
}

export function Hero({
  heroSrc,
  tileSrcs,
  themeId = "everyday",
  allProducts = [],
}: {
  /** admin-uploaded hero background, if any — falls back to the bundled photo */
  heroSrc?: string;
  /** admin-uploaded tile photos, indexed 0-3 — only used for the default collage */
  tileSrcs?: (string | undefined)[];
  /** active storefront theme id — drives which festival config renders */
  themeId?: string;
  /** full catalog, used to resolve a festival's featuredProducts slugs */
  allProducts?: Product[];
} = {}) {
  const params = useSearchParams();
  const preview = params.get("theme");
  // ?theme=<festival> lets an admin preview a takeover without changing the
  // real (persisted) storefront theme — homepage-only, for quick testing.
  const activeId = isFestivalId(preview) ? preview : themeId;
  const festival: FestivalConfig = festivalFor(activeId) ?? DEFAULT_FESTIVAL;
  const accentVar = heroAccentVar(activeId);

  const productBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  const featuredSlugs = festival.featuredProducts ?? [];
  const featuredProducts = featuredSlugs
    .map((slug) => productBySlug.get(slug))
    .filter((p): p is Product => Boolean(p));

  const useDefaultCollage = featuredProducts.length === 0;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-30 overflow-hidden">
        {/* slightly scaled + blurred so any label text baked into the
            source photo (e.g. jar text) never reads as legible copy
            competing with the real headline */}
        <Image
          src={festival.heroImage ?? heroSrc ?? HERO_DEFAULT}
          alt="A jar of Fresh Fusion beef pickle on a wooden kitchen counter, surrounded by whole spices"
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover object-[center_42%] blur-md"
        />
      </div>
      {/* the jar sits dead-centre in the source photo, right under the
          headline column — a stronger wash on the left keeps the text
          readable while the jar itself stays clear on the right, next to
          the product tiles. Fixed dark neutrals, not the theme's own
          --background: on a light theme (Onam, Eid, Christmas, Nowruz)
          a near-white wash at this strength would erase the photo
          entirely, so the hero always reads as a dark photo scene
          regardless of the rest of the site's light/dark theme. The right
          side is darkened further than before so any label text baked
          into the background photo stays illegible under the collage. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-r from-black/85 via-black/65 to-black/50"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-t from-black/70 via-transparent to-black/40"
      />
      <FestiveScene themeId={activeId} />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <motion.p
              key={festival.badge}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
            >
              {festival.badge}
            </motion.p>
          </div>

          <motion.h1
            key={festival.headline.join("|")}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="mt-5 text-4xl font-bold leading-[1.05] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl"
          >
            {festival.headline[0]}
            <span className="block" style={{ color: accentVar }}>
              {festival.headline[1]}
            </span>
          </motion.h1>

          <motion.p
            key={festival.sub}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo, delay: 0.06 }}
            className="mt-5 max-w-md text-base text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-lg"
          >
            {festival.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <ButtonLink href={festival.cta.href} size="lg">
              {festival.cta.text} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <Link
              href={festival.ctaSecondary.href}
              className="text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
            >
              {festival.ctaSecondary.text}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {chips.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {c.label}
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="relative mx-auto grid w-full max-w-sm grid-cols-2 gap-4 lg:max-w-none">
          <div className="ff-lamplight" aria-hidden />
          {/* extra scrim behind the collage so background-photo text never
              shows through the gaps between tiles */}
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-black/25 backdrop-blur-[2px]"
          />
          {useDefaultCollage
            ? DEFAULT_JARS.map((j, i) => (
                <HeroTile
                  key={i}
                  index={i}
                  art={j.art}
                  category={j.category}
                  bundledPhoto={j.photo}
                  alt={j.alt}
                  customSrc={tileSrcs?.[i]}
                />
              ))
            : featuredProducts
                .slice(0, 4)
                .map((p, i) => (
                  <HeroTile
                    key={p.slug}
                    index={i}
                    art={p.art}
                    category={p.category}
                    alt={p.name}
                    slug={p.slug}
                  />
                ))}
        </div>
      </div>
    </section>
  );
}

function HeroTile({
  index,
  art,
  category,
  alt,
  slug,
  bundledPhoto,
  customSrc,
}: {
  index: number;
  art: string;
  category: Category;
  alt: string;
  /** when set, resolves the admin-uploaded product photo for this slug */
  slug?: string;
  /** bundled default photo for the "everyday" collage tiles */
  bundledPhoto?: string;
  /** admin-uploaded hero-tile override (only applies to the default collage) */
  customSrc?: string;
}) {
  const productPhoto = useProductPhoto(slug ?? "");
  const src = customSrc ?? (slug ? productPhoto : bundledPhoto);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: index % 2 ? 3 : -3 }}
      animate={{ opacity: 1, y: 0, rotate: index % 2 ? 1.5 : -1.5 }}
      transition={{
        duration: 0.7,
        ease: easeOutExpo,
        delay: 0.2 + index * 0.08,
      }}
      whileHover={{ y: -6, rotate: 0 }}
      className="aspect-square rounded-2xl border border-border shadow-[0_20px_45px_-20px_var(--glow-soft)] transition-shadow duration-300 hover:shadow-[0_24px_55px_-16px_var(--glow)]"
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="h-full w-full rounded-2xl object-cover"
        />
      ) : (
        <ProductArt
          art={art}
          category={category}
          className="h-full w-full rounded-2xl"
          label="Fresh Fusion jar"
        />
      )}
    </motion.div>
  );
}
