import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // private / transactional pages — nothing here is worth indexing.
      // /api/media stays crawlable so product photos can appear in image search.
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/checkout",
        "/account",
        "/order/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
