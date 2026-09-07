import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProducts } from "@/server/products";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ProductGridSkeleton } from "@/components/product-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse every Fresh Fusion pickle, spice and specialty jar. Filter by category, diet and price, or search by ingredient.",
};

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
