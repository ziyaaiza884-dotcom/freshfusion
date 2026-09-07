import type { Product } from "@/data/types";
import type { OrderStatus, StoredOrder } from "@/lib/orders";

export type StockedProduct = Product & { stockQty: number };

const EXCLUDED: OrderStatus[] = ["cancelled"];
const counts = (o: StoredOrder) => !EXCLUDED.includes(o.status);

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function ordersInRange(
  orders: StoredOrder[],
  fromISO: string,
  toISO: string,
): StoredOrder[] {
  const from = +new Date(fromISO);
  const to = +new Date(toISO);
  return orders.filter((o) => {
    const t = +new Date(o.placedAt);
    return counts(o) && t >= from && t < to;
  });
}

export function revenue(orders: StoredOrder[]): number {
  return orders.filter(counts).reduce((sum, o) => sum + o.totals.total, 0);
}

export function revenueBetween(
  orders: StoredOrder[],
  fromISO: string,
  toISO: string,
): number {
  return revenue(ordersInRange(orders, fromISO, toISO));
}

export function aov(orders: StoredOrder[]): number {
  const valid = orders.filter(counts);
  if (!valid.length) return 0;
  return Math.round(revenue(valid) / valid.length);
}

export interface DayRevenue {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

/** last `days` calendar days ending today (local), oldest first */
export function revenueByDay(
  orders: StoredOrder[],
  days = 7,
  now: Date = new Date(),
): DayRevenue[] {
  const buckets: DayRevenue[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.push({
      date: dayKey(d),
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      revenue: 0,
      orders: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.date, b]));
  for (const o of orders) {
    if (!counts(o)) continue;
    const bucket = index.get(dayKey(new Date(o.placedAt)));
    if (bucket) {
      bucket.revenue += o.totals.total;
      bucket.orders += 1;
    }
  }
  return buckets;
}

export interface SkuStat {
  slug: string;
  name: string;
  qty: number;
  revenue: number;
}

export function topSkus(
  orders: StoredOrder[],
  limit = 5,
): SkuStat[] {
  const map = new Map<string, SkuStat>();
  for (const o of orders) {
    if (!counts(o)) continue;
    for (const line of o.items) {
      const s =
        map.get(line.slug) ??
        { slug: line.slug, name: line.name, qty: 0, revenue: 0 };
      s.qty += line.qty;
      s.revenue += line.qty * line.price;
      map.set(line.slug, s);
    }
  }
  return [...map.values()]
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, limit);
}

export function lowStock(
  products: StockedProduct[],
  threshold = 5,
): StockedProduct[] {
  return products
    .filter((p) => p.stockQty <= threshold)
    .sort((a, b) => a.stockQty - b.stockQty);
}

export interface CodOutstanding {
  amount: number;
  count: number;
}

/** money still to be collected on delivery (COD orders not yet marked paid) */
export function codOutstanding(orders: StoredOrder[]): CodOutstanding {
  const pending = orders.filter(
    (o) =>
      counts(o) &&
      o.payment?.method === "cod" &&
      o.payment.status !== "paid",
  );
  return {
    amount: pending.reduce((sum, o) => sum + o.totals.total, 0),
    count: pending.length,
  };
}

export interface Overview {
  revenueToday: number;
  revenue7d: number;
  ordersToday: number;
  orders7d: number;
  aov: number;
  byDay: DayRevenue[];
  topSkus: SkuStat[];
  lowStock: StockedProduct[];
  totalOrders: number;
  codOutstanding: CodOutstanding;
}

export function buildOverview(
  orders: StoredOrder[],
  products: StockedProduct[],
  now: Date = new Date(),
): Overview {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const in24 = new Date(startOfToday);
  in24.setDate(in24.getDate() + 1);
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const todays = ordersInRange(
    orders,
    startOfToday.toISOString(),
    in24.toISOString(),
  );
  const weeks = ordersInRange(
    orders,
    weekAgo.toISOString(),
    in24.toISOString(),
  );

  return {
    revenueToday: revenue(todays),
    revenue7d: revenue(weeks),
    ordersToday: todays.length,
    orders7d: weeks.length,
    aov: aov(orders),
    byDay: revenueByDay(orders, 7, now),
    topSkus: topSkus(orders, 5),
    lowStock: lowStock(products, 5),
    totalOrders: orders.filter(counts).length,
    codOutstanding: codOutstanding(orders),
  };
}
