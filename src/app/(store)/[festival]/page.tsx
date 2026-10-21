import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/server/products";
import type { Product } from "@/data/types";
import { ProductGrid } from "@/components/product-grid";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { festivalFor } from "@/lib/festivals";
import { pageMetadata } from "@/lib/seo";
import { FESTIVAL_SEO, isFestivalKey } from "@/lib/seo.config";
import { breadcrumbLd } from "@/lib/structured-data";

/**
 * Permanent, year-round festival landing pages: /onam /eid /ramadan /diwali
 * /christmas. Independent of the homepage's auto-switching festival theme —
 * these always exist so they can build search ranking ahead of each season.
 * Any other single-segment path falls through to the 404 page.
 */
export const dynamic = "force-dynamic";

const MAX_PRODUCTS = 12;

type RouteParams = { params: Promise<{ festival: string }> };

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { festival } = await params;
  if (!isFestivalKey(festival)) return { title: "Not found" };
  return pageMetadata(FESTIVAL_SEO[festival], `/${festival}`);
}

export default async function FestivalPage({ params }: RouteParams) {
  const { festival } = await params;
  if (!isFestivalKey(festival)) notFound();

  const seo = FESTIVAL_SEO[festival];
  const config = festivalFor(festival);
  const all = await getAllProducts();

  // the festival's hand-picked hero products first, then everything else
  // that fits the occasion
  const featured = (config?.featuredProducts ?? [])
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is (typeof all)[number] => Boolean(p));
  const rest = all.filter((p) => seo.includes(p) && !featured.includes(p));
  const products: Product[] = [...featured, ...rest].slice(0, MAX_PRODUCTS);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: config?.name ?? seo.heading, path: `/${festival}` },
        ])}
      />
      <PageHeader
        crumbs={[
          { name: "Home", href: "/" },
          { name: config?.name ?? seo.heading, href: `/${festival}` },
        ]}
        eyebrow={config?.badge}
        title={seo.heading}
        intro={seo.intro}
      />

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">
        Picked for {config?.name ?? "the season"}
      </h2>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>

      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Shop everything <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/faq" className="text-muted-foreground hover:text-foreground">
          Delivery & shelf life FAQ
        </Link>
      </div>
    </div>
  );
}
