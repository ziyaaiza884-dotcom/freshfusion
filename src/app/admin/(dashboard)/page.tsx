import Link from "next/link";
import {
  IndianRupee,
  Package,
  ReceiptText,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getStore } from "@/server/store";
import { buildOverview } from "@/lib/analytics";
import { overallRating } from "@/lib/reviews";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/admin/stat-card";
import { MiniBarChart } from "@/components/admin/mini-bar-chart";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const store = await getStore();
  const o = buildOverview(store.orders, store.products);
  const rating = overallRating(store.reviews);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {store.orders.length === 0
          ? "No orders yet — place one from the storefront to see numbers here."
          : `${o.totalOrders} orders all-time.`}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Revenue today"
          value={formatPrice(o.revenueToday)}
          sub={`${o.ordersToday} order${o.ordersToday === 1 ? "" : "s"}`}
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          label="Revenue · 7 days"
          value={formatPrice(o.revenue7d)}
          sub={`${o.orders7d} order${o.orders7d === 1 ? "" : "s"}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Avg order value"
          value={formatPrice(o.aov)}
          sub="all-time"
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          label="COD to collect"
          value={formatPrice(o.codOutstanding.amount)}
          sub={`${o.codOutstanding.count} order${o.codOutstanding.count === 1 ? "" : "s"}`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Avg rating"
          value={rating.count ? `${rating.average.toFixed(1)}★` : "—"}
          sub={`${rating.count} review${rating.count === 1 ? "" : "s"}`}
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          label="Low stock"
          value={String(o.lowStock.length)}
          sub="≤ 5 units"
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-serif text-base font-bold">Revenue, last 7 days</h2>
          <div className="mt-4">
            <MiniBarChart data={o.byDay} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-serif text-base font-bold">Top sellers</h2>
          {o.topSkus.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {o.topSkus.map((s, i) => (
                <li
                  key={s.slug}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <Link
                      href={`/product/${s.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {s.name}
                    </Link>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {s.qty} sold · {formatPrice(s.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-serif text-base font-bold">Low-stock alerts</h2>
        {o.lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Everything is above 5 units.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {o.lowStock.map((p) => (
              <li
                key={p.slug}
                className="flex items-center justify-between rounded-md bg-surface-muted/60 px-3 py-2 text-sm"
              >
                <Link
                  href={`/admin/inventory#${p.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {p.name}
                </Link>
                <span
                  className={
                    p.stockQty === 0
                      ? "font-semibold text-accent"
                      : "text-muted-foreground"
                  }
                >
                  {p.stockQty} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
