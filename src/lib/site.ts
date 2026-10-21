/**
 * The public, absolute base URL of the storefront — used for canonical tags,
 * Open Graph, JSON-LD, robots.txt and sitemap.xml. Change `SITE_URL` (one
 * env var) to move to a custom domain. `NEXT_PUBLIC_SITE_URL` is the older
 * name and still works as a fallback.
 */
export function siteUrl(): string {
  const raw =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** absolute URL for a site path, e.g. absoluteUrl("/faq") */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const productPath = (slug: string) => `/products/${slug}`;
export const categoryPath = (category: string) => `/category/${category}`;
