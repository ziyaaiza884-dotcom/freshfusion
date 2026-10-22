import type { Product } from "@/data/types";

/** festival themes where the (non-veg) beef story is not shown */
export const BEEF_STORY_HIDDEN_ON = ["onam", "diwali"];

export interface SizedProduct<P extends Product = Product> {
  /** e.g. "250 g", "1 kg" */
  label: string;
  grams: number;
  product: P;
}

/**
 * Pack size from the product name when it's typed there ("Beef pickle 1kg"),
 * else from the weight field. The name wins because the admin keeps each
 * beef size as its own product and the name is what shoppers see.
 */
function packSize(p: Product): { label: string; grams: number } {
  const m = p.name.match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
  const grams = m
    ? Number(m[1]) * (m[2].toLowerCase() === "kg" ? 1000 : 1)
    : p.weight;
  const label = grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`;
  return { label, grams };
}

/** every beef pickle product, one per pack size, smallest first */
export function beefVariants<P extends Product>(products: P[]): SizedProduct<P>[] {
  const seen = new Set<string>();
  return products
    .filter((p) => p.category === "pickles" && /\bbeef\b/i.test(p.name))
    .map((p) => ({ ...packSize(p), product: p }))
    .sort((a, b) => a.grams - b.grams)
    .filter((v) => (seen.has(v.label) ? false : (seen.add(v.label), true)));
}
