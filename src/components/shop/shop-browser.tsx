"use client";

import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Product } from "@/data/types";
import {
  applyFilters,
  emptyFilters,
  sortProducts,
  type ProductFilters,
  type SortKey,
} from "@/lib/filters";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";

const VALID_CATEGORIES: Category[] = ["pickles", "spices", "pulses", "rice", "specialty"];

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function ShopBrowser({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const initialCategory = params.get("category");
  const initialQuery = params.get("q") ?? "";

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...emptyFilters,
    query: initialQuery,
    categories:
      initialCategory && VALID_CATEGORIES.includes(initialCategory as Category)
        ? [initialCategory as Category]
        : [],
  }));
  const [sort, setSort] = useState<SortKey>("featured");
  const [drawer, setDrawer] = useState(false);

  // Keep the category filter in step with the shared URL so the header's
  // "Pickles / Spices / Specialty" links work even when we're already on /shop.
  // This is a deliberate state<->URL sync, hence the rule opt-out.
  const categoryParam = params.get("category");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing filter state to the URL
    setFilters((f) => ({
      ...f,
      categories:
        categoryParam && VALID_CATEGORIES.includes(categoryParam as Category)
          ? [categoryParam as Category]
          : [],
    }));
  }, [categoryParam]);

  const results = useMemo(
    () => sortProducts(applyFilters(products, filters), sort),
    [products, filters, sort],
  );

  const patch = (p: Partial<ProductFilters>) =>
    setFilters((f) => ({ ...f, ...p }));
  const reset = () => setFilters({ ...emptyFilters });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          The kitchen
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Shop everything</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {products.length} home-cooked pickles, whole spices and specialty
          jars. Toggle filters or search by ingredient.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          products={products}
          value={filters.query}
          onChange={(q) => patch({ query: q })}
          className="sm:max-w-md sm:flex-1"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            size="md"
            className="lg:hidden"
            onClick={() => setDrawer(true)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <FilterSidebar
          className="hidden lg:block"
          filters={filters}
          onChange={patch}
          onReset={reset}
          resultCount={results.length}
        />

        <div>
          {results.length ? (
            <ProductGrid products={results} />
          ) : (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-serif text-lg font-semibold">
                Nothing matches those filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening the price range or clearing a category.
              </p>
              <Button variant="subtle" className="mt-5" onClick={reset}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setDrawer(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold">Filters</h2>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setDrawer(false)}
                  className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onChange={patch}
                onReset={reset}
                resultCount={results.length}
              />
              <Button
                className="mt-8 w-full"
                onClick={() => setDrawer(false)}
              >
                Show {results.length} results
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
