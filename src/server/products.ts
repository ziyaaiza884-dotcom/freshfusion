import "server-only";
import type { Product } from "@/data/types";
import { getStoreProducts, type StoreProduct } from "./store";

export const getAllProducts = (): Promise<StoreProduct[]> => getStoreProducts();

export async function getProductBySlug(
  slug: string,
): Promise<StoreProduct | undefined> {
  const all = await getStoreProducts();
  return all.find((p) => p.slug === slug);
}

export async function getBestSellers(): Promise<StoreProduct[]> {
  return (await getStoreProducts()).filter((p) => p.isBestSeller);
}

export async function getNewArrivals(): Promise<StoreProduct[]> {
  return (await getStoreProducts()).filter((p) => p.isNew);
}

/** mirror of catalog.getRelated, but over the live store */
export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const all = await getStoreProducts();
  const p = all.find((x) => x.slug === slug);
  if (!p) return [];
  const picks = p.related
    .map((r) => all.find((x) => x.slug === r))
    .filter((x): x is StoreProduct => Boolean(x));
  if (picks.length >= 3) return picks.slice(0, 4);
  const fillers = all.filter(
    (x) => x.slug !== slug && x.category === p.category && !picks.includes(x),
  );
  return [...picks, ...fillers].slice(0, 4);
}
