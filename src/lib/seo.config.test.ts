import { products } from "@/data/catalog";
import {
  CATEGORY_SEO,
  FESTIVAL_SEO,
  HOME_SEO,
  PAGE_SEO,
  PRODUCT_SEO,
  productImageAlt,
  productSeo,
  type PageSeo,
} from "./seo.config";

function problems(label: string, seo: PageSeo): string[] {
  const out: string[] = [];
  if (seo.title.length > 60) out.push(`${label}: title ${seo.title.length} chars`);
  if (!seo.title.endsWith("| Fresh Fusion")) out.push(`${label}: title suffix`);
  const d = seo.description.length;
  if (d < 140 || d > 160) out.push(`${label}: description ${d} chars`);
  return out;
}

function expectGoodCopy(entries: [string, PageSeo][]) {
  expect(entries.flatMap(([k, v]) => problems(k, v))).toEqual([]);
}

describe("seo copy", () => {
  it("home and static pages fit the length rules", () => {
    expectGoodCopy([["home", HOME_SEO], ...Object.entries(PAGE_SEO)]);
  });

  it("category and festival pages fit the length rules", () => {
    expectGoodCopy([...Object.entries(CATEGORY_SEO), ...Object.entries(FESTIVAL_SEO)]);
  });

  it("every hand-written product entry names a real catalog slug", () => {
    const slugs = new Set(products.map((p) => p.slug));
    for (const slug of Object.keys(PRODUCT_SEO)) expect(slugs.has(slug)).toBe(true);
  });

  it("every catalog product gets copy that fits the length rules", () => {
    expectGoodCopy(products.map((p) => [p.slug, productSeo(p)]));
  });

  it("templates still produce a sane title for a long admin-added name", () => {
    const seo = productSeo({
      slug: "x",
      name: "Extra Special Grandmother's Slow Roasted Prawn Pickle With Curry Leaves",
      category: "pickles",
    });
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.description.length).toBeLessThanOrEqual(160);
  });

  it("builds descriptive alt text", () => {
    expect(
      productImageAlt({ name: "Beef Pickle", category: "pickles", weight: 250, unit: "g" }),
    ).toBe("Kerala beef pickle in a 250 g glass jar");
    expect(
      productImageAlt({ name: "Black Pepper", category: "spices", weight: 100, unit: "g" }),
    ).toBe("Kerala black pepper, 100 g pack");
    expect(
      productImageAlt({ name: "Beef Pickle  250g", category: "pickles", weight: 250, unit: "g" }),
    ).toBe("Kerala beef pickle in a 250 g glass jar");
  });
});
