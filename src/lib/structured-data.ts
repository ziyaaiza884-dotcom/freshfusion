/**
 * schema.org JSON-LD builders. Pure functions over real store data — no
 * invented prices or ratings. aggregateRating is deliberately never emitted:
 * the visible star ratings are built partly from generated seed reviews
 * (src/data/seed-reviews.ts), and marking those up would break Google's
 * review-snippet policy. Add it back only once ratings come from real
 * customer reviews alone.
 */
import type { Product } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import { CONTACT_PHONE_TEL } from "./contact";
import { isAnswered, type FaqGroup } from "./faq";
import { BRAND, cleanName } from "./seo.config";
import { absoluteUrl, categoryPath, productPath, siteUrl } from "./site";

type JsonLd = Record<string, unknown>;

const orgId = () => `${siteUrl()}/#organization`;

/** social profile URLs — TODO-JAMSH: add Instagram / Facebook links here */
export const SOCIAL_PROFILES: string[] = [];

export function organizationLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId(),
    name: BRAND,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo.jpeg"),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT_PHONE_TEL.replace("tel:", ""),
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "ml"],
    },
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

export function websiteLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: BRAND,
    url: absoluteUrl("/"),
    inLanguage: "en-IN",
    publisher: { "@id": orgId() },
  };
}

export function productLd(
  p: Pick<
    Product,
    "id" | "slug" | "name" | "description" | "category" | "price" | "inStock"
  > & { stockQty?: number },
  image: string,
): JsonLd {
  const inStock = p.inStock && (p.stockQty === undefined || p.stockQty > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanName(p.name),
    image: [absoluteUrl(image)],
    description: p.description,
    sku: p.id,
    category: CATEGORY_LABELS[p.category],
    brand: { "@type": "Brand", name: BRAND },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productPath(p.slug)),
      price: p.price.toFixed(2),
      priceCurrency: "INR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": orgId() },
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function productBreadcrumbLd(p: Pick<Product, "slug" | "name" | "category">) {
  return breadcrumbLd([
    { name: "Home", path: "/" },
    { name: CATEGORY_LABELS[p.category], path: categoryPath(p.category) },
    { name: cleanName(p.name), path: productPath(p.slug) },
  ]);
}

/** FAQPage from answered questions only; null if none are answered yet */
export function faqLd(groups: FaqGroup[]): JsonLd | null {
  const answered = groups.flatMap((g) => g.items).filter(isAnswered);
  if (answered.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: answered.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
