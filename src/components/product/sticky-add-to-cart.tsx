"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, useCartLine } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "@/components/quantity-stepper";
import { cn } from "@/lib/utils";

/** Mobile-only sticky bar that appears once the main add panel scrolls away. */
export function StickyAddToCart({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const line = useCartLine(product.slug);
  const [qty, setQty] = useState(1);
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const add = () => {
    dispatch({ type: "add", product, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <p className="text-sm font-semibold leading-none">
                {formatPrice(product.price)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {product.name}
              </p>
            </div>
            {product.inStock ? (
              <>
                <QuantityStepper
                  size="sm"
                  value={qty}
                  onChange={setQty}
                  className="ml-auto"
                />
                <button
                  type="button"
                  onClick={add}
                  aria-label={`Add ${product.name} to cart`}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-primary-foreground transition-colors active:scale-95",
                    added ? "bg-primary-strong" : "bg-primary",
                  )}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      {line ? line.qty : "Add"}
                    </>
                  )}
                </button>
              </>
            ) : (
              <span className="ml-auto rounded-md bg-surface-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                Out of stock
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
