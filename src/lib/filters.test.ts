import {
  applyFilters,
  autocomplete,
  emptyFilters,
  matchesQuery,
  sortProducts,
} from "./filters";
import { products, getProduct } from "@/data/catalog";

const beef = getProduct("beef-pickle")!;

describe("matchesQuery", () => {
  it("matches on name substring", () => {
    expect(matchesQuery(beef, "beef")).toBe(true);
  });
  it("matches on an ingredient", () => {
    expect(matchesQuery(beef, "curry")).toBe(true);
  });
  it("requires every whitespace-separated token to match", () => {
    expect(matchesQuery(beef, "beef pepper")).toBe(true);
    expect(matchesQuery(beef, "beef mango")).toBe(false);
  });
  it("an empty query matches everything", () => {
    expect(matchesQuery(beef, "   ")).toBe(true);
  });
});

describe("applyFilters", () => {
  it("filters by category", () => {
    const out = applyFilters(products, {
      ...emptyFilters,
      categories: ["spices"],
    });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((p) => p.category === "spices")).toBe(true);
  });

  it("filters by dietary preference", () => {
    const out = applyFilters(products, {
      ...emptyFilters,
      dietary: ["nonveg"],
    });
    expect(out.every((p) => p.dietary === "nonveg")).toBe(true);
  });

  it("respects the max-price ceiling", () => {
    const out = applyFilters(products, { ...emptyFilters, maxPrice: 150 });
    expect(out.every((p) => p.price <= 150)).toBe(true);
  });

  it("can restrict to in-stock items only", () => {
    const out = applyFilters(products, {
      ...emptyFilters,
      inStockOnly: true,
    });
    expect(out.every((p) => p.inStock)).toBe(true);
    expect(out.length).toBeLessThan(products.length);
  });

  it("combines flags and query", () => {
    const out = applyFilters(products, {
      ...emptyFilters,
      onlyBestSelling: true,
      query: "pickle",
    });
    expect(out.every((p) => p.isBestSeller)).toBe(true);
  });
});

describe("sortProducts", () => {
  it("sorts by price ascending / descending", () => {
    const asc = sortProducts(products, "price-asc").map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = sortProducts(products, "price-desc").map((p) => p.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("does not mutate the input array", () => {
    const before = products.map((p) => p.slug);
    sortProducts(products, "rating");
    expect(products.map((p) => p.slug)).toEqual(before);
  });
});

describe("autocomplete", () => {
  it("returns nothing for a very short query", () => {
    expect(autocomplete(products, "m")).toEqual([]);
  });

  it("ranks a name-prefix match above an ingredient-only match", () => {
    const out = autocomplete(products, "mango");
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].name.toLowerCase()).toContain("mango");
  });

  it("caps the number of suggestions", () => {
    expect(autocomplete(products, "e", 3).length).toBeLessThanOrEqual(3);
  });
});
