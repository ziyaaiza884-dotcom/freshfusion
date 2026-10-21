import { products } from "@/data/catalog";
import {
  faqLd,
  organizationLd,
  productBreadcrumbLd,
  productLd,
} from "./structured-data";

beforeAll(() => {
  process.env.SITE_URL = "https://example.test/";
});

describe("structured data", () => {
  const beef = products.find((p) => p.slug === "beef-pickle")!;

  it("builds a Product with real price, INR and availability, and no rating", () => {
    const ld = productLd({ ...beef, stockQty: 4 }, "/images/og-home.jpg");
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe(beef.name);
    expect(ld.image).toEqual(["https://example.test/images/og-home.jpg"]);
    expect(ld.offers).toMatchObject({
      price: beef.price.toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: "https://example.test/products/beef-pickle",
    });
    expect(ld).not.toHaveProperty("aggregateRating");
  });

  it("marks a product with zero stock as OutOfStock", () => {
    const ld = productLd({ ...beef, inStock: true, stockQty: 0 }, "/x.jpg");
    expect((ld.offers as Record<string, unknown>).availability).toBe(
      "https://schema.org/OutOfStock",
    );
  });

  it("builds breadcrumbs Home > Category > Product with absolute URLs", () => {
    const ld = productBreadcrumbLd(beef);
    const items = ld.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.item)).toEqual([
      "https://example.test/",
      "https://example.test/category/pickles",
      "https://example.test/products/beef-pickle",
    ]);
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it("leaves TODO placeholder answers out of FAQPage", () => {
    const ld = faqLd([
      {
        title: "t",
        items: [
          { q: "Real?", a: "Yes." },
          { q: "Later?", a: "TODO-JAMSH" },
        ],
      },
    ])!;
    expect((ld.mainEntity as unknown[]).length).toBe(1);
    expect(faqLd([{ title: "t", items: [{ q: "x", a: "TODO-JAMSH" }] }])).toBeNull();
  });

  it("omits sameAs when no social profiles are configured", () => {
    expect(organizationLd()).not.toHaveProperty("sameAs");
  });
});
