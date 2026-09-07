"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookmarkPlus, RotateCcw, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { COUPONS, type CartLine } from "@/lib/cart";
import { getProduct } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { ProductArt } from "@/components/product-art";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CartSummary } from "@/components/cart/cart-summary";
import { ProductGridSkeleton } from "@/components/product-grid";

export function CartView() {
  const { state, totals, dispatch, hydrated } = useCart();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <ProductGridSkeleton count={3} />
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface-muted text-muted-foreground">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pickles and spices are cooked in small batches — go pick a few jars.
        </p>
        <ButtonLink href="/shop" className="mt-6">
          Browse the kitchen
        </ButtonLink>

        {state.savedForLater.length > 0 && (
          <div className="mt-14 text-left">
            <h2 className="font-serif text-lg font-bold">Saved for later</h2>
            <ul className="mt-4 space-y-3">
              {state.savedForLater.map((line) => (
                <SavedLine key={line.slug} line={line} />
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const applyCode = () => {
    const key = code.trim().toUpperCase();
    if (!key) return;
    if (!COUPONS[key]) {
      setCodeError("That code isn’t valid. Try FRESH10 or PICKLE50.");
      return;
    }
    setCodeError(null);
    dispatch({ type: "applyDiscount", code: key });
    setCode("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Your cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {totals.count} {totals.count === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            <AnimatePresence initial={false}>
              {state.items.map((line) => (
                <CartLineRow key={line.slug} line={line} />
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6">
            <label
              htmlFor="discount"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Discount code
            </label>
            {state.discountCode ? (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="new">{state.discountCode}</Badge>
                <span className="text-sm text-muted-foreground">
                  {totals.discountLabel} applied
                </span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "applyDiscount", code: null })}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Input
                  id="discount"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCode()}
                  placeholder="FRESH10"
                  className="max-w-[200px] uppercase"
                />
                <Button variant="outline" onClick={applyCode}>
                  Apply
                </Button>
              </div>
            )}
            {codeError && (
              <p className="mt-2 text-xs text-accent">{codeError}</p>
            )}
          </div>

          {state.savedForLater.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-lg font-bold">Saved for later</h2>
              <ul className="mt-4 space-y-3">
                {state.savedForLater.map((line) => (
                  <SavedLine key={line.slug} line={line} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <CartSummary />
      </div>
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const { dispatch } = useCart();
  const product = getProduct(line.slug);
  const lowStock = product ? !product.inStock : false;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 p-4"
    >
      <Link
        href={`/product/${line.slug}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border"
      >
        <ProductArt
          art={line.art}
          category={product?.category ?? "pickles"}
          className="h-full w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/product/${line.slug}`}
              className="font-serif font-semibold hover:text-primary-strong"
            >
              {line.name}
            </Link>
            <p className="text-xs text-muted-foreground">{line.weightLabel}</p>
          </div>
          <p className="font-semibold">{formatPrice(line.price * line.qty)}</p>
        </div>

        {lowStock && (
          <span className="mt-1 w-fit">
            <Badge variant="stock">Limited stock — may ship next batch</Badge>
          </span>
        )}

        {line.note && (
          <p className="mt-1 text-xs italic text-muted-foreground">
            “{line.note}”
          </p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-3">
          <QuantityStepper
            size="sm"
            value={line.qty}
            onChange={(qty) => dispatch({ type: "setQty", slug: line.slug, qty })}
          />
          <button
            type="button"
            onClick={() => dispatch({ type: "saveForLater", slug: line.slug })}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <BookmarkPlus className="h-3.5 w-3.5" /> Save for later
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "remove", slug: line.slug })}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-accent"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}

function SavedLine({ line }: { line: CartLine }) {
  const { dispatch } = useCart();
  const product = getProduct(line.slug);
  return (
    <li className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border">
        <ProductArt
          art={line.art}
          category={product?.category ?? "pickles"}
          className="h-full w-full"
        />
      </div>
      <div className="flex-1">
        <p className="font-serif text-sm font-semibold">{line.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatPrice(line.price)} · {line.weightLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: "moveToCart", slug: line.slug })}
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Move to cart
      </button>
      <button
        type="button"
        aria-label={`Remove ${line.name} from saved items`}
        onClick={() => dispatch({ type: "removeSaved", slug: line.slug })}
        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-accent"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}
