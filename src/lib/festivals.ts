/**
 * Central festival config for the homepage hero: one object per festival
 * drives its badge, headline, sub-copy, CTAs, offer strip, decoration and
 * featured products. Nothing festival-specific is hardcoded in the hero,
 * offer strip, navbar or badge components — they all read from here.
 *
 * "everyday" (the house default) is exported separately as DEFAULT_FESTIVAL
 * rather than living in the FESTIVALS map, mirroring how the theme system
 * treats it as the un-festive baseline.
 */
import type { Category } from "@/data/types";

export type ParticleKind = "star" | "snow" | "petal" | "spark";
export type DecorationKey =
  | "ramadan"
  | "eid"
  | "onam"
  | "diwali"
  | "christmas";

export interface CtaLink {
  text: string;
  href: string;
}

export interface FestivalConfig {
  key: string;
  name: string;
  badge: string;
  /** [line 1, line 2] — line 2 renders in the hero's accent colour */
  headline: [string, string];
  sub: string;
  cta: CtaLink;
  ctaSecondary: CtaLink;
  /** thin announcement bar shown above the navbar; omit for no strip */
  offerStrip?: string;
  /** ambient particle animation behind the hero content */
  particle?: ParticleKind;
  /** bespoke SVG scene (lanterns, diyas, pookalam, etc.) */
  decoration?: DecorationKey;
  /** product slugs shown in the hero's photo collage, in order */
  featuredProducts?: string[];
  /**
   * Optional dedicated hero background photo, e.g.
   * `/images/festivals/diwali/hero.webp`. If the file doesn't exist on
   * disk, leave this unset — the code always falls back to the default
   * bundled hero photo / admin-uploaded one, so a missing file never
   * breaks the page.
   */
  heroImage?: string;
  /**
   * Auto-activation window, inclusive, as ISO dates (YYYY-MM-DD) for a
   * SPECIFIC year. Only Christmas has a fixed Gregorian date, so it's the
   * only one pre-filled below. Ramadan, Eid and Onam shift every year
   * (lunar / lunisolar calendars) — rather than guess wrong dates, they're
   * left unscheduled by default. To auto-activate one for real, add that
   * year's actual dates here (e.g. "2027-03-10" to "2027-04-08" for next
   * Ramadan) — update it yearly, or just switch themes manually in
   * Admin → Settings, which always takes priority over these dates.
   */
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_FESTIVAL: FestivalConfig = {
  key: "everyday",
  name: "Everyday",
  badge: "100% HOME-COOKED · FSSAI-APPROVED",
  headline: ["Home-cooked flavours,", "delivered fresh."],
  sub: "Small batches of beef, fish and baby-mango pickles, whole hill spices, and ready-to-cook gravies — made in a family kitchen and packed within 48 hours.",
  cta: { text: "Shop the kitchen", href: "/shop" },
  ctaSecondary: { text: "Browse spice packs", href: "/shop?category=spices" },
};

export const FESTIVALS: Record<string, FestivalConfig> = {
  ramadan: {
    key: "ramadan",
    name: "Ramadan",
    badge: "RAMADAN KAREEM",
    headline: ["Flavours for every", "iftar table."],
    sub: "Dates, dry fruits, pickles and spices for suhoor and iftar, made in small batches and packed within 48 hours.",
    cta: { text: "Shop Ramadan essentials", href: "/shop" },
    ctaSecondary: {
      text: "Dates & dry fruits",
      href: "/shop?category=specialty",
    },
    offerStrip: "Ramadan specials on dates, dry fruits and pickle combos",
    particle: "star",
    decoration: "ramadan",
    featuredProducts: [
      "dry-raisin-jar",
      "cashew-nut-pieces-in-oil",
      "garlic-pickle",
      "black-pepper",
    ],
  },
  eid: {
    key: "eid",
    name: "Eid",
    badge: "EID MUBARAK",
    headline: ["Share the taste", "of home this Eid."],
    sub: "Gift boxes of dates, dry fruits and home-made pickles, packed for family, friends and neighbours.",
    cta: { text: "Shop Eid gift boxes", href: "/shop" },
    ctaSecondary: {
      text: "Build your own hamper",
      href: "/shop?category=specialty",
    },
    offerStrip: "Eid Mubarak! Festive gift boxes now available",
    particle: "star",
    decoration: "eid",
    featuredProducts: [
      "dry-raisin-pack",
      "cashew-nut-pack",
      "garlic-pickle",
      "cardamom",
    ],
  },
  onam: {
    key: "onam",
    name: "Onam",
    badge: "HAPPY ONAM",
    headline: ["A sadya-worthy spread,", "delivered."],
    sub: "Mango, lemon and veg-mix pickles for your sadya leaf, made the Kerala way in a family kitchen.",
    cta: { text: "Shop the sadya pickles", href: "/shop?category=pickles" },
    ctaSecondary: {
      text: "Kerala spice packs",
      href: "/shop?category=spices",
    },
    offerStrip: "Onashamsakal! Sadya pickle combos are here",
    particle: "petal",
    decoration: "onam",
    featuredProducts: [
      "baby-mango-pickle",
      "lemon-pickle",
      "veg-mix-pickle",
      "garlic-pickle",
    ],
  },
  diwali: {
    key: "diwali",
    name: "Diwali",
    badge: "HAPPY DIWALI",
    headline: ["Light up the", "festive table."],
    sub: "Spice packs, dry fruits and pickle hampers for gifting, made fresh and packed within 48 hours.",
    cta: { text: "Shop Diwali hampers", href: "/shop" },
    ctaSecondary: {
      text: "Dry fruit gift packs",
      href: "/shop?category=specialty",
    },
    offerStrip: "Diwali gifting: hampers and dry fruit boxes",
    particle: "spark",
    decoration: "diwali",
    featuredProducts: [
      "dry-raisin-pack",
      "cashew-nut-pack",
      "garlic-pickle",
      "black-pepper",
    ],
    startDate: "2026-11-01",
    endDate: "2026-11-10",
  },
  christmas: {
    key: "christmas",
    name: "Christmas",
    badge: "MERRY CHRISTMAS",
    headline: ["Kerala Christmas,", "on your table."],
    sub: "Beef and fish pickles, plus whole spices for your stew, roast and plum cake, home-cooked in small batches.",
    cta: { text: "Shop Christmas specials", href: "/shop?category=pickles" },
    ctaSecondary: { text: "Spices for baking", href: "/shop?category=spices" },
    offerStrip: "Merry Christmas! Festive pickle and spice combos",
    particle: "snow",
    decoration: "christmas",
    featuredProducts: ["beef-pickle", "fish-pickle", "black-pepper", "cinnamon"],
    startDate: "2026-12-15",
    endDate: "2026-12-26",
  },
};

/** legacy dressing for themes without a full festival takeover (kept working
 *  as-is; only badge/particle, no headline/cta/decoration override) */
export const LEGACY_FESTIVE: Record<
  string,
  { badge: string; particle: ParticleKind; photo: string; photoAlt: string }
> = {
  nowruz: {
    badge: "NOWRUZ PIROUZ",
    particle: "petal",
    photo: "/images/festive/nowruz.jpg",
    photoAlt: "A pink tulip in bloom",
  },
};

export function festivalFor(themeId: string): FestivalConfig | undefined {
  return FESTIVALS[themeId];
}

/** which veg-only categories a "no non-veg" festival restricts its
 *  featured-product fallback (used only if a slug lookup fails) to */
export const VEG_ONLY_FALLBACK_CATEGORIES: Category[] = [
  "pickles",
  "spices",
  "pulses",
  "rice",
  "specialty",
];

/**
 * Resolves which festival/theme should actually render, given the admin's
 * saved Settings choice and today's date:
 *  1. If the admin picked anything other than "everyday", that choice wins
 *     outright — an explicit choice is always a deliberate override.
 *  2. Otherwise, auto-activate a festival whose start/end date (this
 *     specific year) covers today.
 *  3. Otherwise, "everyday".
 */
export function resolveActiveFestivalId(
  settingsThemeId: string,
  referenceDate: Date = new Date(),
): string {
  if (settingsThemeId !== "everyday") return settingsThemeId;

  const todayIso = referenceDate.toISOString().slice(0, 10);
  for (const festival of Object.values(FESTIVALS)) {
    if (!festival.startDate || !festival.endDate) continue;
    if (todayIso >= festival.startDate && todayIso <= festival.endDate) {
      return festival.key;
    }
  }
  return "everyday";
}

/**
 * Per-theme colour choice for hero text drawn over the dark photo scrim
 * (the headline's second line, and used as a safe accent elsewhere in the
 * hero). The hero's scrim is fixed near-black regardless of theme, but
 * `--primary-strong` is tuned dark for *light* themes' own light
 * backgrounds (Onam, Eid, Christmas, Nowruz) — using it directly here
 * produced near-invisible dark-on-black text. `--spice` is a bright
 * gold/orange in every theme, so light themes use that instead; dark
 * themes (whose primary-strong is already light) keep using it as-is.
 */
export function heroAccentVar(themeId: string): string {
  const DARK_THEMES = new Set(["everyday", "diwali", "ramadan"]);
  return DARK_THEMES.has(themeId) ? "var(--primary-strong)" : "var(--spice)";
}
