import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Leaf, Sprout } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/server/products";
import { getReviewsForProduct } from "@/server/store";
import { CATEGORY_LABELS, DIETARY_LABELS } from "@/data/types";
import { formatDate, formatPrice, formatWeight } from "@/lib/format";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { StickyAddToCart } from "@/components/product/sticky-add-to-cart";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductCarousel } from "@/components/carousel";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/stars";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.blurb,
  };
}

export default async function ProductPage({ params }: RouteParams) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(slug),
    getReviewsForProduct(slug),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-foreground"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery
          art={product.art}
          category={product.category}
          name={product.name}
        />

        <div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Sprout className="h-3 w-3" /> Home-cooked
            </Badge>
            {product.isHot && <Badge variant="hot">Hot</Badge>}
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isBestSeller && <Badge variant="best">Best-seller</Badge>}
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-4">
            <Stars rating={product.rating} count={product.reviewCount} />
            <span className="text-sm text-muted-foreground">
              {DIETARY_LABELS[product.dietary]}
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold text-foreground">
            {formatPrice(product.price)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              / {formatWeight(product.weight, product.unit)}
            </span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary">
            <Leaf className="h-3.5 w-3.5" />
            Last batch cooked {formatDate(product.madeOn)}
          </p>

          {product.inStock && product.stockQty > 0 && product.stockQty <= 5 && (
            <p className="mt-1.5 text-xs font-medium text-accent">
              Only {product.stockQty} jar{product.stockQty === 1 ? "" : "s"} left
              from this batch
            </p>
          )}

          <div className="mt-6">
            <AddToCartPanel product={product} />
          </div>

          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-foreground">Ingredients</dt>
              <dd className="mt-1 text-muted-foreground">
                {product.ingredients.join(", ")}.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Allergen info</dt>
              <dd className="mt-1 text-muted-foreground">
                {product.allergens.length
                  ? `Contains: ${product.allergens.join(", ")}. `
                  : "No major allergens declared. "}
                Cooked in a kitchen that also handles mustard, sesame and tree
                nuts.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Storage</dt>
              <dd className="mt-1 text-muted-foreground">
                Keep refrigerated after opening. Use a dry spoon. Best within 3
                months of the batch date.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ReviewsSection slug={slug} initialReviews={reviews} />

      {related.length > 0 && (
        <Section className="mt-20 px-0 sm:px-0">
          <Reveal>
            <SectionHeading eyebrow="Cross-sell" title="Customers also bought" />
          </Reveal>
          <ProductCarousel products={related} label="Customers also bought" />
        </Section>
      )}

      <StickyAddToCart product={product} />
    </div>
  );
}
