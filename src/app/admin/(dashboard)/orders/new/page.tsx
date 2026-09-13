import { getStoreProducts } from "@/server/store";
import { NewOrderForm } from "@/components/admin/new-order-form";

export const dynamic = "force-dynamic";

export default async function AdminNewOrderPage() {
  const products = await getStoreProducts();
  const options = products
    .filter((p) => p.inStock)
    .map((p) => ({ slug: p.slug, name: p.name, price: p.price }));

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Log a WhatsApp order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        For orders taken over WhatsApp or in person — appears in Orders and
        Customers just like a website order.
      </p>
      <div className="mt-6 max-w-2xl">
        <NewOrderForm products={options} />
      </div>
    </div>
  );
}
