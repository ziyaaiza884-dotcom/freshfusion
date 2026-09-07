"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/types";
import { useCart, useCartLine } from "@/context/cart-context";
import { formatPrice, formatWeight } from "@/lib/format";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { dispatch } = useCart();
  const line = useCartLine(product.slug);
  const [justAdded, setJustAdded] = useState(false);

  const add = () => {
    dispatch({ type: "add", product });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <ProductArt
          art={product.art}
          category={product.category}
          label={`${product.name} — illustration`}
          className={cn(
            "h-full w-full transition-transform duration-500 group-hover:scale-[1.04]",
            priority && "",
          )}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isHot && <Badge variant="hot">Hot</Badge>}
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isBestSeller && <Badge variant="best">Best-seller</Badge>}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[1px]">
            <Badge variant="stock">Out of stock</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-semibold leading-tight">
            <Link
              href={`/product/${product.slug}`}
              className="transition-colors hover:text-primary-strong"
            >
              {product.name}
            </Link>
          </h3>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.blurb}
        </p>

        <div className="mt-2">
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-base font-semibold text-foreground">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatWeight(product.weight, product.unit)}
            </p>
          </div>

          <button
            type="button"
            onClick={add}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-40",
              justAdded
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {line ? `In cart · ${line.qty}` : "Add"}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
