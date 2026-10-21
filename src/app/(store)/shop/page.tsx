import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProducts } from "@/server/products";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ProductGridSkeleton } from "@/components/product-grid";
import { pageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seo.config";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata(PAGE_SEO.shop, "/shop");
}

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ProductGridSkeleton count={6} />
        </div>
      }
    >
      <ShopBrowser products={products} />
    </Suspense>
  );
}
