"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, PackageCheck, RotateCcw, Truck } from "lucide-react";
import {
  getOrder as getLocalOrder,
  ORDER_FLOW,
  type OrderStatus,
  type PlacedOrder,
  type StoredOrder,
} from "@/lib/orders";
import { getProduct, products } from "@/data/catalog";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { ProductPhoto } from "@/components/product-photo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { easeOutExpo } from "@/components/ui/motion";

const STEPS: { icon: typeof CheckCircle2; label: string; status: OrderStatus }[] =
  [
    { icon: CheckCircle2, label: "Order placed", status: "placed" },
    { icon: PackageCheck, label: "Cooking & packing", status: "packing" },
    { icon: Truck, label: "Out for delivery", status: "out_for_delivery" },
    { icon: MapPin, label: "Delivered", status: "delivered" },
  ];

type AnyOrder = StoredOrder | PlacedOrder;
const hasStatus = (o: AnyOrder): o is StoredOrder => "status" in o;

export function OrderView({ id }: { id: string }) {
  const { dispatch } = useCart();
  const [order, setOrder] = useState<AnyOrder | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "missing">(
    "loading",
  );
  const [reordered, setReordered] = useState(false);

  // Prefer the server copy (authoritative status); fall back to the local
  // mirror written at checkout so the page still works offline.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        if (res.ok) {
          const { order: fetched } = (await res.json()) as {
            order: StoredOrder;
          };
          if (alive) {
            setOrder(fetched);
            setStatus("found");
          }
          return;
        }
      } catch {
        /* fall through to local mirror */
      }
      const local = getLocalOrder(id);
      if (alive) {
        setOrder(local);
        setStatus(local ? "found" : "missing");
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (status === "missing" || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn’t find <span className="font-mono">{id}</span> on this
          device. Orders in this demo are stored locally in your browser.
        </p>
        <ButtonLink href="/shop" className="mt-6">
          Back to the shop
        </ButtonLink>
      </div>
    );
  }

  const reorder = () => {
    for (const line of order.items) {
      const product =
        getProduct(line.slug) ?? products.find((p) => p.slug === line.slug);
      if (product)
        dispatch({
          type: "add",
          product,
          qty: line.qty,
          note: line.note,
        });
    }
    setReordered(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary"
      >
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>

      <h1 className="mt-5 text-center text-3xl font-bold">Thank you!</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Order <span className="font-mono font-semibold text-foreground">{order.id}</span>{" "}
        is in. A confirmation is on its way to {order.customer.email}.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Truck className="h-4 w-4 text-primary" />
          Estimated delivery: {order.etaFrom} – {order.etaTo}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Chosen slot: {order.deliverySlot}
        </p>

        {hasStatus(order) && order.status === "cancelled" ? (
          <p className="mt-5 rounded-lg bg-[#f6e4e4] px-3 py-3 text-sm font-medium text-accent">
            This order was cancelled. If that’s a surprise, contact support.
          </p>
        ) : (
          <ol className="mt-5 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const currentIndex = hasStatus(order)
                ? ORDER_FLOW.indexOf(order.status)
                : 0;
              const done = i <= currentIndex;
              return (
                <li key={s.label} className="text-center">
                  <span
                    className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`mt-1.5 block text-[11px] leading-tight ${
                      i === currentIndex
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-5 grid place-items-center rounded-lg border border-dashed border-border bg-surface-muted/50 py-8 text-center">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <p className="mt-1 text-xs text-muted-foreground">
            Live rider tracking arrives in a later release
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-serif text-lg font-bold">In this box</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((line) => {
            const product = getProduct(line.slug);
            return (
              <li key={line.slug} className="flex items-center gap-3 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
                  <ProductPhoto
                    slug={line.slug}
                    art={line.art}
                    category={product?.category ?? "pickles"}
                    className="h-full w-full"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {line.qty}
                    {line.note ? ` · “${line.note}”` : ""}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(line.price * line.qty)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
          <Row label="Subtotal" value={formatPrice(order.totals.subtotal)} />
          {order.totals.discount > 0 && (
            <Row
              label="Discount"
              value={`− ${formatPrice(order.totals.discount)}`}
            />
          )}
          <Row label="Packaging" value={formatPrice(order.totals.packaging)} />
          <Row
            label="Delivery"
            value={
              order.totals.delivery === 0
                ? "Free"
                : formatPrice(order.totals.delivery)
            }
          />
          <Row label="GST" value={formatPrice(order.totals.tax)} />
          <Row label="Total" value={formatPrice(order.totals.total)} bold />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {order.payment?.status === "paid"
            ? `Paid via ${order.paymentMethod}`
            : order.payment?.method === "cod"
              ? `${formatPrice(order.totals.total)} due on delivery (cash)`
              : `Payment ${order.payment?.status ?? "pending"} · ${order.paymentMethod}`}
          {order.payment?.paymentId ? ` · ${order.payment.paymentId}` : ""} ·
          shipping to {order.address.line1}, {order.address.city}{" "}
          {order.address.pincode}
        </p>
        {order.giftNote && (
          <p className="mt-1 text-xs italic text-muted-foreground">
            Gift note: “{order.giftNote}”
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant={reordered ? "subtle" : "primary"} onClick={reorder}>
          <RotateCcw className="h-4 w-4" />
          {reordered ? "Added back to cart" : "Reorder this cart"}
        </Button>
        {reordered && (
          <ButtonLink href="/cart" variant="outline">
            Go to cart
          </ButtonLink>
        )}
        <ButtonLink href="/shop" variant="ghost">
          Continue shopping
        </ButtonLink>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Need help? <Link href="/cart" className="text-primary hover:underline">Contact support</Link>
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
    </div>
  );
}
