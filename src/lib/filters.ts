import type { Category, Dietary, Product } from "@/data/types";

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";

export interface ProductFilters {
  categories: Category[];
  dietary: Dietary[];
  maxPrice: number | null;
  onlyNew: boolean;
  onlyBestSelling: boolean;
  inStockOnly: boolean;
  query: string;
}

export const emptyFilters: ProductFilters = {
  categories: [],
  dietary: [],
  maxPrice: null,
  onlyNew: false,
  onlyBestSelling: false,
  inStockOnly: false,
  query: "",
};

const norm = (s: string) => s.toLowerCase().trim();

export function matchesQuery(product: Product, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  const haystack = [
    product.name,
    product.blurb,
    product.category,
    ...product.ingredients,
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function applyFilters(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  return products.filter((p) => {
    if (filters.categories.length && !filters.categories.includes(p.category))
      return false;
    if (filters.dietary.length && !filters.dietary.includes(p.dietary))
      return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    if (filters.onlyNew && !p.isNew) return false;
    if (filters.onlyBestSelling && !p.isBestSeller) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (!matchesQuery(p, filters.query)) return false;
    return true;
  });
}

export function sortProducts(products: Product[], key: SortKey): Product[] {
  const copy = [...products];
  switch (key) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort(
        (a, b) => +new Date(b.madeOn) - +new Date(a.madeOn),
      );
    case "featured":
    default:
      return copy.sort((a, b) => {
        const score = (p: Product) =>
          (p.isBestSeller ? 2 : 0) + (p.isNew ? 1 : 0) + (p.inStock ? 0.5 : 0);
        return score(b) - score(a);
      });
  }
}

export interface Suggestion {
  slug: string;
  name: string;
  category: Category;
}

export function autocomplete(
  products: Product[],
  query: string,
  limit = 6,
): Suggestion[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const scored = products
    .map((p) => {
      const name = p.name.toLowerCase();
      const ingredientHit = p.ingredients.some((i) =>
        i.toLowerCase().includes(q),
      );
      let score = 0;
      if (name.startsWith(q)) score = 3;
      else if (name.includes(q)) score = 2;
      else if (ingredientHit) score = 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, limit);
  return scored.map(({ p }) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
  }));
}
