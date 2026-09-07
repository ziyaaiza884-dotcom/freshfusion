import { getOrders } from "@/server/store";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {orders.length === 0
          ? "No orders yet."
          : `${orders.length} order${orders.length === 1 ? "" : "s"}, newest first.`}
      </p>
      <div className="mt-6">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
