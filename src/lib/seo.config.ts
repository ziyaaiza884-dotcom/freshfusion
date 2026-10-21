/**
 * Single source of truth for page titles, meta descriptions and image alt
 * text. Every public page builds its <head> tags from here via
 * `pageMetadata()` (src/lib/seo.ts), so copy changes happen in one place.
 *
 * Rules the copy follows (enforced by seo.config.test.ts):
 *  - title ≤ 60 chars, ending "| Fresh Fusion"
 *  - description 140–160 chars
 *  - only mention things the shop actually sells
 */
import type { Category, Product } from "@/data/types";

export const BRAND = "Fresh Fusion";

export interface PageSeo {
  title: string;
  description: string;
}

export const HOME_SEO: PageSeo = {
  title: "Home-made Kerala Pickles & Spices | Fresh Fusion",
  description:
    "Home-cooked Kerala beef, fish and mango pickles, whole spices, dals and Kerala rice. Made in small batches, FSSAI-approved and packed fresh within 48 hours.",
};

export const PAGE_SEO = {
  shop: {
    title: "Shop Kerala Pickles, Spices & Dals Online | Fresh Fusion",
    description:
      "Browse every Fresh Fusion pickle, spice pack, dal and Kerala rice. Filter by category, veg or non-veg and price. Home-made in small batches, packed fresh.",
  },
  about: {
    title: "About Our Family Kitchen – FSSAI-Approved | Fresh Fusion",
    description:
      "Fresh Fusion is a family kitchen in Kerala making pickles and spice packs in small batches, the way they are made at home. FSSAI-approved and packed fresh.",
  },
  faq: {
    title: "FAQ – Shelf Life, Storage & Delivery | Fresh Fusion",
    description:
      "Answers on pickle shelf life, storage, delivery areas and times, FSSAI approval, returns, ingredients, allergens and veg vs non-veg at Fresh Fusion.",
  },
  contact: {
    title: "Contact Us – WhatsApp & Phone Orders | Fresh Fusion",
    description:
      "Order Kerala pickles and spices on WhatsApp or by phone, or ask us anything about delivery, ingredients and bulk orders. We usually reply within the day.",
  },
} satisfies Record<string, PageSeo>;

export interface CategorySeo extends PageSeo {
  heading: string;
  intro: string;
}

export const CATEGORY_SEO: Record<Category, CategorySeo> = {
  pickles: {
    title: "Kerala Pickles – Home-made Beef, Fish & Mango | Fresh Fusion",
    description:
      "Home-made Kerala pickles: beef, fish, baby mango, lemon, garlic and veg-mix, cooked in small batches in a family kitchen. FSSAI-approved, packed fresh.",
    heading: "Home-made Kerala pickles",
    intro:
      "Beef and fish pickles slow-cooked in dark masala, tender baby mangoes, lemon, garlic and sadya-style veg mix — each batch cooked at home and jarred fresh.",
  },
  spices: {
    title: "Kerala Spice Packs – Whole & Ground | Fresh Fusion",
    description:
      "Fresh Kerala spice packs, whole and ground, for curries, biryani, stew and baking. Packed in small batches for full aroma. Shop online today.",
    heading: "Kerala spice packs",
    intro:
      "Whole pepper, cardamom, cloves and cinnamon from the hills, plus everyday seeds and powders — packed in small batches so they reach you still fragrant.",
  },
  pulses: {
    title: "Kerala Dals & Pulses – Toor, Moong, Urad | Fresh Fusion",
    description:
      "Toor, moong, urad and chana dal for sambar, parippu curry and payasam. Cleaned, sorted and packed in small batches for everyday Kerala cooking. Shop now.",
    heading: "Dals & pulses",
    intro:
      "The dals behind sambar, parippu curry and payasam — cleaned, sorted and packed in small batches for everyday Kerala cooking.",
  },
  rice: {
    title: "Kerala Matta & Biryani Rice | Fresh Fusion",
    description:
      "Kerala matta boiled rice, jeerakasala biryani rice and a ready ghee rice mix, packed fresh for everyday meals and festive biryani. Delivered to your door.",
    heading: "Kerala rice",
    intro:
      "Red matta rice for everyday meals, fragrant jeerakasala for biryani, and a ghee rice mix for when guests turn up.",
  },
  specialty: {
    title: "Chutneys, Masala Mixes & Gravies | Fresh Fusion",
    description:
      "Home-made chutneys, masala mixes and ready-to-cook Kerala gravies from our family kitchen. Small batches, no shortcuts, packed fresh. Order online today.",
    heading: "Chutneys, masalas & gravies",
    intro:
      "Kitchen shortcuts made the slow way — chutneys, masala mixes and ready-to-cook gravies from the same family kitchen as our pickles.",
  },
};

export const FESTIVAL_KEYS = [
  "onam",
  "eid",
  "ramadan",
  "diwali",
  "christmas",
] as const;
export type FestivalKey = (typeof FESTIVAL_KEYS)[number];

export const isFestivalKey = (k: string): k is FestivalKey =>
  (FESTIVAL_KEYS as readonly string[]).includes(k);

export interface FestivalSeo extends PageSeo {
  heading: string;
  intro: string;
  /** which products appear on the festival page, after its featured ones */
  includes: (p: Product) => boolean;
}

export const FESTIVAL_SEO: Record<FestivalKey, FestivalSeo> = {
  onam: {
    title: "Onam Sadya Pickles & Combos | Fresh Fusion",
    description:
      "Mango, lemon and veg-mix pickles for your Onam sadya, made the Kerala way in a family kitchen. Vegetarian combos, packed fresh. Order online now.",
    heading: "Onam sadya pickles & combos",
    intro:
      "No sadya leaf is complete without a spoon of pickle. Mango, lemon, veg-mix and more — all vegetarian, cooked at home and packed fresh for Onam.",
    includes: (p) =>
      p.dietary === "veg" && (p.category === "pickles" || p.category === "rice"),
  },
  eid: {
    title: "Eid Gift Hampers – Pickles, Cashews & Spices | Fresh Fusion",
    description:
      "Eid gift hampers of home-made pickles, cashews, raisins and whole spices, packed for family, friends and neighbours. Build your own hamper. Order now.",
    heading: "Eid gift hampers",
    intro:
      "Share the taste of home this Eid. Pick home-made pickles, cashews, raisins and whole spices and we'll pack them fresh for family and friends.",
    includes: (p) =>
      p.category === "pickles" ||
      p.slug.includes("cashew") ||
      p.slug.includes("raisin") ||
      p.slug === "biriyani-rice",
  },
  ramadan: {
    title: "Ramadan Iftar Essentials – Pickles & Spices | Fresh Fusion",
    description:
      "Pickles, cashews, raisins and whole spices for suhoor and iftar, made in small batches and packed within 48 hours. Shop Ramadan essentials online today.",
    heading: "Ramadan iftar essentials",
    intro:
      "Everything for the iftar table and the suhoor kitchen — pickles, cashews, raisins and whole spices, made in small batches and packed within 48 hours.",
    includes: (p) =>
      p.category === "pickles" ||
      p.category === "spices" ||
      p.slug === "biriyani-rice",
  },
  diwali: {
    title: "Diwali Hampers – Spices, Cashews & Pickles | Fresh Fusion",
    description:
      "Diwali hampers with spice packs, cashews, raisins and vegetarian pickles, made fresh and packed within 48 hours. Perfect for festive gifting. Order now.",
    heading: "Diwali hampers",
    intro:
      "Light up the festive table with spice packs, cashews, raisins and vegetarian pickles — made fresh and packed within 48 hours for gifting.",
    includes: (p) =>
      p.dietary === "veg" && (p.category === "pickles" || p.category === "spices"),
  },
  christmas: {
    title: "Kerala Christmas Beef & Fish Pickles | Fresh Fusion",
    description:
      "Kerala Christmas specials: home-made beef and fish pickles plus whole spices for stew, roast and plum cake. Small batches, packed fresh. Order now.",
    heading: "Kerala Christmas specials",
    intro:
      "Beef and fish pickles for the Christmas table, plus the whole spices that go into stew, roast and plum cake — home-cooked in small batches.",
    includes: (p) =>
      (p.category === "pickles" && p.dietary === "nonveg") ||
      ["black-pepper", "cinnamon", "cloves", "cardamom"].includes(p.slug),
  },
};

/** hand-written copy for products where it matters most; everything else,
 *  including products added later from the admin, uses productSeo()'s
 *  category template */
export const PRODUCT_SEO: Record<string, PageSeo> = {
  "beef-pickle": {
    title: "Kerala Beef Pickle (Irachi Achar) – Home-made | Fresh Fusion",
    description:
      "Spicy Kerala-style beef pickle (irachi achar), home-cooked in small batches. FSSAI-approved and packed fresh within 48 hours. Order online today.",
  },
  "fish-pickle": {
    title: "Kerala Fish Pickle (Meen Achar) – Home-made | Fresh Fusion",
    description:
      "Kerala-style fish pickle (meen achar), home-cooked the traditional way in small batches. FSSAI-approved and packed fresh. Order online today.",
  },
  "cut-mango-pickle": {
    title: "Kerala Mango Pickle (Manga Achar) – Home-made | Fresh Fusion",
    description:
      "Tangy Kerala mango pickle (manga achar), made in a family kitchen in small batches. Perfect with rice, curd rice and sadya. Order online today.",
  },
  "baby-mango-pickle": {
    title: "Kerala Baby Mango Pickle (Kanni Manga) | Fresh Fusion",
    description:
      "Kerala baby mango pickle (kanni manga achar), whole tender mangoes in a spicy brine, made in a family kitchen in small batches. Perfect with curd rice.",
  },
  "lemon-pickle": {
    title: "Kerala Lemon Pickle (Naranga Achar) | Fresh Fusion",
    description:
      "Home-made Kerala lemon pickle (naranga achar), tangy and spicy, made in small family batches. FSSAI-approved and packed fresh. Order online today.",
  },
  "veg-mix-pickle": {
    title: "Kerala Mixed Vegetable Pickle – Home-made | Fresh Fusion",
    description:
      "Home-made Kerala mixed vegetable pickle, 100% vegetarian, made in small batches. A must for sadya and everyday meals. Packed fresh, order online today.",
  },
  "garlic-pickle": {
    title: "Kerala Garlic Pickle (Veluthulli Achar) | Fresh Fusion",
    description:
      "Home-made Kerala garlic pickle (veluthulli achar), bold and spicy, made in small batches. FSSAI-approved and packed fresh. Order online today.",
  },
  "green-chilli-pickle": {
    title: "Kerala Green Chilli Pickle – Home-made | Fresh Fusion",
    description:
      "Fiery Kerala green chilli pickle, home-made in small batches with fresh chillies and spices. FSSAI-approved and packed fresh. Order online today.",
  },
  "irimpampuli-pickle": {
    title: "Kerala Irimpampuli Pickle – Home-made | Fresh Fusion",
    description:
      "Sour, spicy Kerala irimpampuli pickle, a rare home-style favourite made in small batches. FSSAI-approved and packed fresh. Order online today.",
  },
  "pineapple-pickle": {
    title: "Kerala Pineapple Pickle – Home-made | Fresh Fusion",
    description:
      "Sweet, tangy and spicy Kerala pineapple pickle, home-made in small batches. A sadya favourite, FSSAI-approved and packed fresh. Order online.",
  },
};

const SUFFIX = ` | ${BRAND}`;
const TITLE_MAX = 60;

/** collapse stray whitespace, e.g. "Beef Pickle  250g" → "Beef Pickle 250g" */
export const cleanName = (name: string) => name.replace(/\s+/g, " ").trim();

/** drop parenthesised local names and any pack size typed into the name,
 *  e.g. "Toor Dal (Thuvara Parippu)" → "Toor Dal", "Beef Pickle 250g" → "Beef Pickle" */
const shortName = (name: string) =>
  cleanName(
    name
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\b\d+(\.\d+)?\s?(g|gm|kg|ml|l)\b/gi, ""),
  );

/** first candidate within [min, max]; else the longest one under max;
 *  else the last (shortest) candidate */
function fit(candidates: string[], min: number, max: number): string {
  const inRange = candidates.find((c) => c.length >= min && c.length <= max);
  if (inRange) return inRange;
  const under = candidates
    .filter((c) => c.length <= max)
    .sort((a, b) => b.length - a.length);
  return under[0] ?? candidates[candidates.length - 1];
}

const CATEGORY_TAIL: Record<Category, string[]> = {
  pickles: [
    "home-cooked in small batches in a Kerala family kitchen. FSSAI-approved and packed fresh within 48 hours. Order online today.",
    "home-cooked in small batches in a family kitchen. FSSAI-approved and packed fresh. Order online today.",
    "home-cooked in small batches. FSSAI-approved and packed fresh. Order online.",
  ],
  spices: [
    "packed in small batches for full aroma in curries, biryani, stew and everyday Kerala cooking. Delivered fresh. Shop online today.",
    "packed in small batches for full aroma in curries, biryani and stew. Delivered fresh to your door. Shop online today.",
    "packed in small batches for full aroma. Delivered fresh to your door. Shop online.",
  ],
  pulses: [
    "cleaned, sorted and packed in small batches for sambar, parippu curry and payasam. Delivered fresh to your door. Shop online today.",
    "cleaned, sorted and packed in small batches for sambar and parippu curry. Delivered fresh. Shop online today.",
    "cleaned, sorted and packed in small batches. Delivered fresh. Shop online.",
  ],
  rice: [
    "packed fresh for everyday Kerala meals, festive biryani and family feasts. Carefully sorted and delivered to your door. Order online.",
    "packed fresh for everyday Kerala meals and festive biryani. Delivered to your door. Order online today.",
    "packed fresh for Kerala meals. Delivered to your door. Order online.",
  ],
  specialty: [
    "made the slow way in our Kerala family kitchen, in small batches with no shortcuts. Packed fresh and delivered. Order online today.",
    "made the slow way in our family kitchen, in small batches. Packed fresh and delivered. Order online today.",
    "made in small batches in our family kitchen. Packed fresh. Order online.",
  ],
};

export function productSeo(p: Pick<Product, "slug" | "name" | "category">): PageSeo {
  const hand = PRODUCT_SEO[p.slug];
  if (hand) return hand;

  const name = shortName(p.name);
  const kerala = /kerala/i.test(name) ? name : `Kerala ${name}`;
  const label =
    p.category === "pickles" ? "Home-made" : p.category === "spices" ? "Spice Pack" : "Fresh Fusion";
  const title = fit(
    [
      label === "Fresh Fusion" ? `${kerala}${SUFFIX}` : `${kerala} – ${label}${SUFFIX}`,
      `${kerala}${SUFFIX}`,
      `${name}${SUFFIX}`,
      `${name.slice(0, TITLE_MAX - SUFFIX.length - 1).trimEnd()}…${SUFFIX}`,
    ],
    1,
    TITLE_MAX,
  );
  const description = fit(
    CATEGORY_TAIL[p.category].map((tail) => `${kerala} from Fresh Fusion, ${tail}`).concat(
      CATEGORY_TAIL[p.category].map((tail) => `${name}, ${tail}`),
    ),
    140,
    160,
  );
  return { title, description };
}

/** descriptive alt text for a product's photo,
 *  e.g. "Kerala beef pickle in a 250 g glass jar" */
export function productImageAlt(
  p: Pick<Product, "name" | "category" | "weight" | "unit">,
): string {
  const name = shortName(p.name);
  const kerala = /kerala/i.test(name) ? name : `Kerala ${name.toLowerCase()}`;
  const size = `${p.weight} ${p.unit}`;
  return p.category === "pickles"
    ? `${kerala} in a ${size} glass jar`
    : `${kerala}, ${size} pack`;
}
