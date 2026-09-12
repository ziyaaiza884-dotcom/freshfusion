/**
 * Per-theme festive dressing for the homepage hero: a greeting line, an
 * ambient particle style (stars / snow / petals / sparks), and a real photo
 * for the corner badge — not illustrated art. Deliberately keyed off the
 * theme id, not the theme's `dark` flag — each festival has its own
 * character, not just a palette. "everyday" (the house default)
 * intentionally has no entry: no festival dressing on the plain storefront.
 */
export type ParticleKind = "star" | "snow" | "petal" | "spark";

export interface FestiveConfig {
  greeting: string;
  particle: ParticleKind;
  /** a real photo for the corner badge, under public/images/festive/ */
  photo: string;
  photoAlt: string;
}

export const FESTIVE: Partial<Record<string, FestiveConfig>> = {
  eid: {
    greeting: "Eid Mubarak",
    particle: "star",
    photo: "/images/festive/eid.jpg",
    photoAlt: "Crescent moon and star atop a mosque",
  },
  ramadan: {
    greeting: "Ramadan Mubarak",
    particle: "star",
    photo: "/images/festive/ramadan.jpg",
    photoAlt: "A lit fanous lantern at dusk",
  },
  diwali: {
    greeting: "Happy Diwali",
    particle: "spark",
    photo: "/images/festive/diwali.jpg",
    photoAlt: "Lit diyas surrounded by flower petals",
  },
  onam: {
    greeting: "Onam Ashamsakal",
    particle: "petal",
    photo: "/images/festive/onam.jpg",
    photoAlt: "Fresh pookalam flowers",
  },
  christmas: {
    greeting: "Merry Christmas",
    particle: "snow",
    photo: "/images/festive/christmas.jpg",
    photoAlt: "A Christmas ornament on a lit tree",
  },
  nowruz: {
    greeting: "Nowruz Pirouz",
    particle: "petal",
    photo: "/images/festive/nowruz.jpg",
    photoAlt: "A pink tulip in bloom",
  },
};

export function festiveFor(themeId: string): FestiveConfig | undefined {
  return FESTIVE[themeId];
}

/**
 * Fixed layout for ambient particles — NOT randomised at render time, so
 * server and client markup match exactly (Math.random() here would cause a
 * hydration mismatch). 14 slots is plenty for a subtle effect; particles
 * pick a slice of this list based on how many they need.
 */
export const PARTICLE_SLOTS = [
  { left: 4, top: 10, size: 9, delay: 0, duration: 7.5 },
  { left: 12, top: 55, size: 5, delay: 1.3, duration: 9 },
  { left: 20, top: 22, size: 7, delay: 2.6, duration: 6.5 },
  { left: 29, top: 68, size: 5, delay: 0.5, duration: 8.5 },
  { left: 37, top: 14, size: 8, delay: 3.2, duration: 7 },
  { left: 45, top: 40, size: 4, delay: 1.8, duration: 9.5 },
  { left: 53, top: 8, size: 6, delay: 2.2, duration: 6 },
  { left: 61, top: 60, size: 5, delay: 0.2, duration: 8 },
  { left: 69, top: 30, size: 8, delay: 3.6, duration: 7.5 },
  { left: 77, top: 50, size: 4, delay: 1.1, duration: 9 },
  { left: 85, top: 18, size: 7, delay: 2.9, duration: 6.5 },
  { left: 91, top: 66, size: 5, delay: 0.8, duration: 8.5 },
  { left: 8, top: 78, size: 6, delay: 4, duration: 7 },
  { left: 95, top: 38, size: 5, delay: 1.6, duration: 9 },
] as const;
