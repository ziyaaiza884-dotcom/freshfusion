import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/server/products";
import { CATEGORY_LABELS, type Category } from "@/data/types";
import { ProductGrid } from "@/components/product-grid";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { CATEGORY_SEO } from "@/lib/seo.config";
import { breadcrumbLd } from "@/lib/structured-data";
import { categoryPath } from "@/lib/site";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ category: string }> };

const isCategory = (c: string): c is Category =>
  Object.hasOwn(CATEGORY_LABELS, c);

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return { title: "Not found" };
  return pageMetadata(CATEGORY_SEO[category], categoryPath(category));
}

export default async function CategoryPage({ params }: RouteParams) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const seo = CATEGORY_SEO[category];
  const label = CATEGORY_LABELS[category];
  const products = (await getAllProducts()).filter(
    (p) => p.category === category,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: label, path: categoryPath(category) },
        ])}
      />
      <PageHeader
        crumbs={[
          { name: "Home", href: "/" },
          { name: label, href: categoryPath(category) },
        ]}
        eyebrow={`${products.length} product${products.length === 1 ? "" : "s"}`}
        title={seo.heading}
        intro={seo.intro}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[])
          .filter((c) => c !== category)
          .map((c) => (
            <Link
              key={c}
              href={categoryPath(c)}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {CATEGORY_LABELS[c]}
            </Link>
          ))}
      </div>

      <h2 className="sr-only">All {label.toLowerCase()}</h2>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>

      <Link
        href={`/shop?category=${category}`}
        className="mt-10 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Filter by price and diet in the shop <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
