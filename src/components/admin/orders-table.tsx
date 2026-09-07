"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  ORDER_FLOW,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentInfo,
  type StoredOrder,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: OrderStatus[] = [...ORDER_FLOW, "cancelled"];

const badgeTone: Record<OrderStatus, string> = {
  placed: "bg-surface-muted text-muted-foreground",
  packing: "bg-[#fff2e0] text-[#8a5320]",
  out_for_delivery: "bg-[#e6efe6] text-primary-strong",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-[#f6e4e4] text-accent",
};

function paymentLabel(p: PaymentInfo): { text: string; tone: string } {
  if (p.status === "paid")
    return { text: "Paid", tone: "bg-primary/10 text-primary" };
  if (p.method === "cod")
    return { text: "COD due", tone: "bg-[#fff2e0] text-[#8a5320]" };
  return {
    text: PAYMENT_STATUS_LABELS[p.status],
    tone: "bg-[#f6e4e4] text-accent",
  };
}

export function OrdersTable({ orders }: { orders: StoredOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Orders placed at checkout will show up here.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </div>
  );
}

function OrderRow({ order }: { order: StoredOrder }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [payment, setPayment] = useState(order.payment);
  const [saving, setSaving] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectPayment = async () => {
    setCollecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "collect_payment" }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        order?: StoredOrder;
        error?: string;
      };
      if (!res.ok || !j.order) throw new Error(j.error ?? "Update failed");
      setPayment(j.order.payment);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setCollecting(false);
    }
  };

  const changeStatus = async (next: OrderStatus) => {
    const prev = status;
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Update failed (${res.status})`);
      }
      router.refresh();
    } catch (e) {
      setStatus(prev);
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const placed = new Date(order.placedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <span>
            <span className="font-mono text-sm font-semibold">{order.id}</span>
            <span className="ml-2 text-xs text-muted-foreground">{placed}</span>
          </span>
        </button>

        <span className="text-sm text-muted-foreground">
          {order.customer.name}
        </span>

        <span className="ml-auto font-semibold tabular-nums">
          {formatPrice(order.totals.total)}
        </span>

        {(() => {
          const p = paymentLabel(payment);
          return (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                p.tone,
              )}
              title={`${payment.method.toUpperCase()} · ${PAYMENT_STATUS_LABELS[payment.status]}`}
            >
              {p.text}
            </span>
          );
        })()}

        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            badgeTone[status],
          )}
        >
          {ORDER_STATUS_LABELS[status]}
        </span>

        <div className="flex items-center gap-2">
          <select
            value={status}
            disabled={saving}
            onChange={(e) => changeStatus(e.target.value as OrderStatus)}
            className="h-9 rounded-md border border-border bg-surface px-2 text-xs focus:border-primary focus:outline-none"
            aria-label={`Status for ${order.id}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {error && (
        <p className="px-4 pb-2 text-xs text-accent">{error}</p>
      )}

      {open && (
        <div className="grid gap-5 border-t border-border p-4 text-sm sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Items
            </h3>
            <ul className="mt-2 space-y-1">
              {order.items.map((line) => (
                <li key={line.slug} className="flex justify-between gap-3">
                  <span>
                    {line.name}
                    <span className="text-muted-foreground"> × {line.qty}</span>
                    {line.note && (
                      <span className="block text-xs italic text-muted-foreground">
                        “{line.note}”
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">
                    {formatPrice(line.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-0.5 border-t border-border pt-2 text-xs text-muted-foreground">
              <Line label="Subtotal" value={formatPrice(order.totals.subtotal)} />
              {order.totals.discount > 0 && (
                <Line
                  label="Discount"
                  value={`− ${formatPrice(order.totals.discount)}`}
                />
              )}
              <Line
                label="Delivery"
                value={
                  order.totals.delivery === 0
                    ? "Free"
                    : formatPrice(order.totals.delivery)
                }
              />
              <Line label="GST" value={formatPrice(order.totals.tax)} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Deliver to
            </h3>
            <p className="mt-2">
              {order.customer.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city} {order.address.pincode}, {order.address.state}
              <br />
              {order.customer.phone} · {order.customer.email}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Slot: {order.deliverySlot}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Payment: {order.paymentMethod} ·{" "}
              <span
                className={
                  payment.status === "paid"
                    ? "text-primary"
                    : payment.method === "cod"
                      ? "text-[#8a5320]"
                      : "text-accent"
                }
              >
                {PAYMENT_STATUS_LABELS[payment.status]}
              </span>
              {payment.gatewayOrderId && (
                <>
                  <br />
                  <span className="font-mono">
                    {payment.gatewayOrderId}
                    {payment.paymentId ? ` / ${payment.paymentId}` : ""}
                  </span>
                </>
              )}
            </p>
            {payment.method === "cod" && payment.status !== "paid" && (
              <button
                type="button"
                onClick={collectPayment}
                disabled={collecting}
                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                {collecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Mark COD collected"
                )}
              </button>
            )}
            {order.giftNote && (
              <p className="mt-2 text-xs italic text-muted-foreground">
                Gift note: “{order.giftNote}”
              </p>
            )}

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              History
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {order.statusHistory.map((h, i) => (
                <li key={i}>
                  {ORDER_STATUS_LABELS[h.status]} —{" "}
                  {new Date(h.at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
