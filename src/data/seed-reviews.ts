import type { Review } from "@/lib/reviews";
import { products } from "./catalog";

/**
 * Deterministic seed reviews so every product looks lived-in on first run.
 * The real ratings shown in the UI are always computed from this list plus
 * whatever shoppers add later.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const NAMES = [
  "Anjali M.", "Rahul K.", "Fathima P.", "Deepak S.", "Meera Nair",
  "Vishnu R.", "Sneha T.", "Arun Kumar", "Priya V.", "Thomas J.",
  "Lakshmi B.", "Nikhil P.", "Aisha S.", "Gopika R.", "Sameer A.",
];

const GOOD = [
  "Tastes like the one my grandmother makes. Portion is generous too.",
  "Bought it on a whim, now it's a monthly order. Beautifully balanced.",
  "Fresh, well-packed, reached in two days. The oil isn't heavy at all.",
  "You can tell it's home-cooked — nothing artificial, real depth of flavour.",
  "Perfect heat for us. Kids can eat it, adults still find it interesting.",
  "Great with curd rice and dosa alike. Reordering before the jar runs out.",
  "The masala is properly roasted, not raw-tasting like some brands.",
  "Opened it and the whole kitchen smelled like a Sunday lunch. Lovely.",
  "Been buying pickles online for years — this is easily in my top three.",
  "My in-laws asked where I got it. That never happens.",
];
const OKAY = [
  "Good flavour but a touch saltier than I expected. Still finished the jar.",
  "Solid everyday option. Nothing fancy, does the job well.",
  "Nice, though I wish the pieces were a little bigger.",
  "Pleasant and fresh. A bit mild for me — added my own chilli.",
  "Decent. Delivery was quick and the jar was sealed properly.",
];
const MEH = [
  "It was fine. Not bad, not memorable. Might try a different one next time.",
  "Arrived well but the taste didn't wow me. Personal preference maybe.",
  "Bit oilier than I like. The flavour underneath is alright though.",
];

const TITLES = [
  "Reminds me of home", "Will reorder", "Fresh and honest", "A proper staple",
  "Pleasantly surprised", "Does exactly what I wanted", "Family approved",
  "Better than the shop version", "Worth it", "Would recommend",
];

function pick<T>(pool: T[], n: number): T {
  return pool[((n % pool.length) + pool.length) % pool.length];
}

function bodyFor(salt: number, rating: number) {
  const pool = rating >= 4 ? GOOD : rating === 3 ? OKAY : MEH;
  return pick(pool, salt);
}

export function seedReviews(): Review[] {
  const out: Review[] = [];
  for (const p of products) {
    const rng = mulberry32(hash(p.slug));
    const n = Math.max(1, Math.min(5, Math.round(p.reviewCount / 45)));
    const baseDay = 20 + (hash(p.slug) % 8); // Aug 20-27 2026 window start
    const h = hash(p.slug);
    for (let i = 0; i < n; i++) {
      // ratings cluster around the seeded average, occasionally lower
      const jitter = rng() < 0.25 ? -1 : rng() < 0.15 ? -2 : 0;
      const rating = Math.max(
        2,
        Math.min(5, Math.round(p.rating) + jitter),
      );
      const d = new Date(2026, 7, baseDay + i * 2, 9 + i);
      out.push({
        id: `rev_seed_${p.slug}_${i}`,
        productSlug: p.slug,
        author: pick(NAMES, h + i * 7),
        rating,
        title: rng() < 0.7 ? pick(TITLES, h * 3 + i * 5) : undefined,
        body: bodyFor(h + i * 13, rating),
        verified: rng() < 0.75,
        hidden: false,
        createdAt: d.toISOString(),
      });
    }
  }
  return out;
}
