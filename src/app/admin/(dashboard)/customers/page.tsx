import { getCustomerReport } from "@/server/store";
import { CustomersTable } from "@/components/admin/customers-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomerReport();
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {customers.length === 0
          ? "No customers yet."
          : `${customers.length} customer${customers.length === 1 ? "" : "s"}, one row per person — every web order, WhatsApp order, and account is merged by email or phone.`}
      </p>
      <div className="mt-6">
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
