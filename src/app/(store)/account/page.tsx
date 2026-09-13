"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Package } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { StoredOrder } from "@/lib/orders";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountPage() {
  const router = useRouter();
  const { customer, hydrated, logout } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    let alive = true;
    fetch("/api/orders/mine", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { orders?: StoredOrder[]; error?: string }) => {
        if (!alive) return;
        if (data.orders) setOrders(data.orders);
        else setError(data.error ?? "Could not load orders");
      })
      .catch(() => alive && setError("Could not load orders"));
    return () => {
      alive = false;
    };
  }, [customer]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-16 sm:px-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold">Sign in to see your orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an account or sign in to track past orders in one place.
        </p>
        <ButtonLink href="/account/login" className="mt-6">
          Sign in
        </ButtonLink>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hi, {customer.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{customer.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-accent"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Your orders
      </h2>

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}

      {orders === null && !error ? (
        <div className="mt-3 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : orders && orders.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-border py-14 text-center">
          <Package className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No orders yet — your first jar is a click away.
          </p>
          <ButtonLink href="/shop" className="mt-4">
            Browse the kitchen
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {orders?.map((o) => (
            <li key={o.id}>
              <Link
                href={`/order/${o.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{o.id}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(o.placedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(o.totals.total)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {ORDER_STATUS_LABELS[o.status]}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
