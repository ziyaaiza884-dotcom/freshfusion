"use client";

import { motion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";

export function CartSummary({ showCheckout = true }: { showCheckout?: boolean }) {
  const { totals } = useCart();
  const pct = totals.freeDeliveryRemaining
    ? Math.min(
        100,
        Math.round(
          ((totals.subtotal - totals.discount) /
            (totals.subtotal - totals.discount + totals.freeDeliveryRemaining)) *
            100,
        ),
      )
    : 100;

  return (
    <aside className="h-fit rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-24">
      <h2 className="font-serif text-lg font-bold">Order summary</h2>

      <div className="mt-4 space-y-2.5 text-sm">
        <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
        {totals.discount > 0 && (
          <Row
            label={`Discount${totals.discountLabel ? ` · ${totals.discountLabel}` : ""}`}
            value={`− ${formatPrice(totals.discount)}`}
            accent
          />
        )}
        <Row label="Packaging" value={formatPrice(totals.packaging)} />
        <Row
          label="Delivery"
          value={totals.delivery === 0 ? "Free" : formatPrice(totals.delivery)}
        />
        <Row label="GST (5%)" value={formatPrice(totals.tax)} />
        <div className="my-3 border-t border-border" />
        <Row label="Total" value={formatPrice(totals.total)} bold />
      </div>

      {totals.freeDeliveryRemaining > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            Add{" "}
            <span className="font-semibold text-foreground">
              {formatPrice(totals.freeDeliveryRemaining)}
            </span>{" "}
            more for free delivery
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs font-medium text-primary">
          You’ve unlocked free delivery 🎉
        </p>
      )}

      {showCheckout && (
        <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
          Checkout
        </ButtonLink>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Taxes shown are indicative · demo checkout, no real payment
      </p>
    </aside>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          bold
            ? "font-semibold text-foreground"
            : accent
              ? "text-primary"
              : "text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          bold ? "text-base font-bold" : accent ? "text-primary" : "text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
