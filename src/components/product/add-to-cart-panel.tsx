"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, useCartLine } from "@/context/cart-context";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function AddToCartPanel({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const line = useCartLine(product.slug);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const add = () => {
    dispatch({
      type: "add",
      product,
      qty,
      note: note.trim() || undefined,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  if (!product.inStock) {
    return (
      <div className="rounded-xl border border-border bg-surface-muted/60 p-5">
        <p className="font-serif text-lg font-semibold">Currently out of stock</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This jar is between batches. Check back in a few days — we cook it
          fresh rather than hold stock.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Add a note for the packer
      </label>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. less salt · whole spices only · extra bubble wrap"
        className="mt-2"
        maxLength={160}
      />

      <div className="mt-4 flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} />
        <Button className="flex-1" onClick={add}>
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Added to cart
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {line && (
        <p className="mt-3 text-sm text-muted-foreground">
          {line.qty} already in your cart ·{" "}
          <Link href="/cart" className="font-semibold text-primary hover:underline">
            view cart
          </Link>
        </p>
      )}
    </div>
  );
}
