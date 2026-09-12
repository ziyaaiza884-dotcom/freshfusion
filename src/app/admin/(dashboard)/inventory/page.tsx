import { getProductPhotoIndex, getStoreProducts } from "@/server/store";
import { InventoryTable } from "@/components/admin/inventory-table";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [products, photoIndex] = await Promise.all([
    getStoreProducts(),
    getProductPhotoIndex(),
  ]);
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Inventory</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {products.length} products. Edits take effect on the storefront
        immediately.
      </p>
      <div className="mt-6">
        <InventoryTable products={products} photoIndex={photoIndex} />
      </div>
    </div>
  );
}
