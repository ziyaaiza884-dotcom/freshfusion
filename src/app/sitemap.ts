import type { MetadataRoute } from "next";
import { getAllProducts } from "@/server/products";
import { CATEGORY_LABELS, type Category } from "@/data/types";
import { FESTIVAL_KEYS } from "@/lib/seo.config";
import { absoluteUrl, categoryPath, productPath } from "@/lib/site";

// Built per request from the live store, so products added or removed in
// the admin show up here without a redeploy (and the build never needs a
// database connection).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const now = new Date();

  const page = (
    path: string,
    priority: number,
    changeFrequency: "daily" | "weekly" | "monthly",
    lastModified: Date = now,
  ) => ({ url: absoluteUrl(path), lastModified, changeFrequency, priority });

  return [
    page("/", 1, "daily"),
    page("/shop", 0.9, "daily"),
    ...(Object.keys(CATEGORY_LABELS) as Category[]).map((c) =>
      page(categoryPath(c), 0.8, "weekly"),
    ),
    ...products.map((p) => {
      const made = new Date(p.madeOn);
      return page(
        productPath(p.slug),
        0.8,
        "weekly",
        Number.isNaN(made.getTime()) ? now : made,
      );
    }),
    ...FESTIVAL_KEYS.map((f) => page(`/${f}`, 0.6, "monthly")),
    page("/about", 0.5, "monthly"),
    page("/faq", 0.5, "monthly"),
    page("/contact", 0.5, "monthly"),
  ];
}
