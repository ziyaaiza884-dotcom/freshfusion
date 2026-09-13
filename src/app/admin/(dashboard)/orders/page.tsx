import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getOrders } from "@/server/store";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length === 0
              ? "No orders yet."
              : `${orders.length} order${orders.length === 1 ? "" : "s"}, newest first.`}
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary/10 px-3.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <MessageCircle className="h-4 w-4" /> Log WhatsApp order
        </Link>
      </div>
      <div className="mt-6">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
