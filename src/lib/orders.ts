import type { CartLine } from "./cart";
import type { CartTotals } from "./cart";

export type PaymentMethod = "cod" | "card" | "upi" | "wallet";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  /** gateway order id (Razorpay-style "order_…") */
  gatewayOrderId?: string;
  /** gateway payment id ("pay_…") */
  paymentId?: string;
  paidAt?: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  card: "Card",
  upi: "UPI",
  wallet: "Wallet",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
};

/** methods that route through the gateway rather than being collected on delivery */
export const isPrepaid = (method: PaymentMethod) => method !== "cod";

export interface PlacedOrder {
  id: string;
  placedAt: string;
  items: CartLine[];
  totals: CartTotals;
  customer: { name: string; email: string; phone: string };
  address: {
    line1: string;
    line2: string;
    pincode: string;
    city: string;
    state: string;
  };
  deliverySlot: string;
  /** human label, kept for display; structured detail lives in `payment` */
  paymentMethod: string;
  payment: PaymentInfo;
  giftNote: string;
  /** window shown on the confirmation screen */
  etaFrom: string;
  etaTo: string;
  /** how the order was taken — the storefront checkout, or logged manually
   *  by an admin from a WhatsApp conversation. Defaults to "web" for any
   *  order placed before this field existed. */
  source?: "web" | "whatsapp";
  /** signed-in customer this order belongs to, if any (see lib/customers.ts) */
  customerId?: string;
}

export type OrderStatus =
  | "placed"
  | "packing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/** forward workflow (cancelled is a side exit, not part of the line) */
export const ORDER_FLOW: OrderStatus[] = [
  "placed",
  "packing",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order placed",
  packing: "Cooking & packing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export interface StatusEvent {
  status: OrderStatus;
  at: string;
}

/** an order as it lives in the server store */
export interface StoredOrder extends PlacedOrder {
  status: OrderStatus;
  statusHistory: StatusEvent[];
}

const KEY = "freshfusion.orders.v1";

export function generateOrderId(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `FF-${new Date().getFullYear()}-${n}`;
}

export function saveOrder(order: PlacedOrder) {
  try {
    const all = readAll();
    all[order.id] = order;
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function getOrder(id: string): PlacedOrder | null {
  return readAll()[id] ?? null;
}

function readAll(): Record<string, PlacedOrder> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, PlacedOrder>) : {};
  } catch {
    return {};
  }
}

/** toy pincode → city/state lookup for the demo auto-fill */
export const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  "682001": { city: "Kochi", state: "Kerala" },
  "682016": { city: "Kochi", state: "Kerala" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "500001": { city: "Hyderabad", state: "Telangana" },
};

export function lookupPincode(pincode: string) {
  return PINCODE_MAP[pincode] ?? null;
}

export function deliverySlots(): string[] {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  const base = new Date();
  const slots: string[] = [];
  for (let i = 2; i <= 5; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    slots.push(`${fmt(d)} · 9am–1pm`);
    slots.push(`${fmt(d)} · 4pm–8pm`);
  }
  return slots;
}

export function etaWindow(): { from: string; to: string } {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const from = new Date();
  from.setDate(from.getDate() + 2);
  const to = new Date();
  to.setDate(to.getDate() + 4);
  return { from: fmt(from), to: fmt(to) };
}
