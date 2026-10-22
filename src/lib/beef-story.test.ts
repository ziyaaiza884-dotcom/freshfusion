import { products } from "@/data/catalog";
import type { Product } from "@/data/types";
import { beefVariants } from "./beef-story";

const base = products.find((p) => p.slug === "beef-pickle")!;
const make = (slug: string, name: string, extra: Partial<Product> = {}): Product => ({
  ...base,
  slug,
  name,
  ...extra,
});

describe("beefVariants", () => {
  it("reads sizes from names like the live admin data, smallest first", () => {
    const v = beefVariants([
      make("veg-mix-pickle", "Beef pickle 1kg", { price: 1300, weight: 250 }),
      make("beef-pickle", "Beef Pickle  250g", { price: 399 }),
      make("fish-pickle", "Beef pickle  500g", { price: 740, weight: 250 }),
      make("garlic-pickle", "Garlic Pickle"),
    ]);
    expect(v.map((x) => [x.label, x.product.slug])).toEqual([
      ["250 g", "beef-pickle"],
      ["500 g", "fish-pickle"],
      ["1 kg", "veg-mix-pickle"],
    ]);
  });

  it("falls back to the weight field when the name has no size", () => {
    expect(beefVariants([make("beef-pickle", "Beef Pickle")])[0].label).toBe("250 g");
  });

  it("ignores non-pickle beef products and duplicate sizes", () => {
    const v = beefVariants([
      make("a", "Beef Pickle 250g"),
      make("b", "Beef pickle 250 g"),
      make("c", "Beef Masala 250g", { category: "spices" }),
    ]);
    expect(v.map((x) => x.product.slug)).toEqual(["a"]);
  });
});
