import type { Metadata } from "next";
import { BRAND, type PageSeo } from "./seo.config";
import { absoluteUrl } from "./site";

/** 1200×630 share image used for the home page and as the fallback */
export const DEFAULT_OG_IMAGE = {
  url: "/images/og-home.jpg",
  width: 1200,
  height: 630,
  alt: "Fresh Fusion home-made Kerala beef pickle with whole spices",
};

/**
 * <title>, description, canonical, Open Graph and Twitter tags for one page.
 * `path` is the page's own path with no query string — the canonical is
 * always absolute and query-free, so ?theme= / ?category= variants
 * consolidate onto one URL.
 */
export function pageMetadata(
  seo: PageSeo,
  path: string,
  image?: { url: string; alt: string; width?: number; height?: number },
  type: "website" | "article" = "website",
): Metadata {
  const canonical = absoluteUrl(path);
  const img = image ?? DEFAULT_OG_IMAGE;
  const images = [{ ...img, url: absoluteUrl(img.url) }];
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical },
    openGraph: {
      type,
      siteName: BRAND,
      locale: "en_IN",
      title: seo.title,
      description: seo.description,
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: images.map((i) => i.url),
    },
  };
}
