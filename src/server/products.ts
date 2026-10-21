import "server-only";
import type { Product } from "@/data/types";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import {
  getProductPhotoIndex,
  getStoreProducts,
  type StoreProduct,
} from "./store";

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

/**
 * Best image path for a product's share card / JSON-LD: its admin-uploaded
 * photo if it has one, else the site's default share image.
 */
export async function getProductImagePath(slug: string): Promise<string> {
  const index = await getProductPhotoIndex();
  const v = index[slug];
  return v ? `/api/media/product/${slug}/${v}` : DEFAULT_OG_IMAGE.url;
}
