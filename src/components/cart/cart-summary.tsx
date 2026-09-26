"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";

export function CartSummary({ showCheckout = true }: { showCheckout?: boolean }) {
  const { state, totals, dispatch } = useCart();
  const { customer, hydrated } = useAuth();

  const welcomeEligible =
    hydrated && customer?.welcomeOfferEligible && !customer.welcomeOfferUsedAt;
  const welcomeApplied = welcomeEligible && state.discountCode === "WELCOME10";

  useEffect(() => {
    if (welcomeEligible && !state.discountCode) {
      dispatch({ type: "applyDiscount", code: "WELCOME10" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when eligibility or the current code changes
  }, [welcomeEligible, state.discountCode]);

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
        {totals.tax > 0 && (
          <Row label="GST" value={formatPrice(totals.tax)} />
        )}
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

      {welcomeApplied && (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary">
          <Sparkles className="h-4 w-4 shrink-0" />
          Your 10% new-member discount is applied
        </p>
      )}

      {showCheckout && (
        <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
          Checkout
        </ButtonLink>
      )}

      {hydrated && !customer && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link href="/account/login" className="font-semibold text-primary hover:underline">
            Sign in or sign up
          </Link>{" "}
          — new accounts get 10% off their first order
        </p>
      )}
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
