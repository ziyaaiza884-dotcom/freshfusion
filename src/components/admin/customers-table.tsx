import { MessageCircle, ShieldCheck } from "lucide-react";
import type { CustomerReportEntry } from "@/server/store";
import { formatPrice } from "@/lib/format";
import { customerWhatsAppUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

const sourceLabel: Record<string, string> = {
  web: "Website",
  whatsapp: "WhatsApp",
};

export function CustomersTable({
  customers,
}: {
  customers: CustomerReportEntry[];
}) {
  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Customers show up here once someone orders, signs in, or you log a
        WhatsApp order for them.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Orders</th>
            <th className="px-4 py-3 font-semibold">Total spent</th>
            <th className="px-4 py-3 font-semibold">Last order</th>
            <th className="px-4 py-3 font-semibold">Via</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {customers.map((c) => (
            <tr key={c.key} className="bg-surface">
              <td className="px-4 py-3">
                <p className="flex items-center gap-1.5 font-medium">
                  {c.name || "—"}
                  {c.hasAccount && (
                    <span title="Has an account">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    </span>
                  )}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {c.phone && <p>{c.phone}</p>}
                {c.email && <p>{c.email}</p>}
              </td>
              <td className="px-4 py-3 tabular-nums">{c.orderCount}</td>
              <td className="px-4 py-3 tabular-nums font-medium">
                {formatPrice(c.totalSpent)}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {c.orderCount > 0
                  ? new Date(c.lastOrderAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {c.sources.length === 0 ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    c.sources.map((s) => (
                      <span
                        key={s}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          s === "whatsapp"
                            ? "bg-[#25D366]/15 text-[#128C4A]"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {sourceLabel[s] ?? s}
                      </span>
                    ))
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                {c.phone && (
                  <a
                    href={customerWhatsAppUrl(
                      c.phone,
                      `Hi ${c.name.split(" ")[0] || "there"}! This is Fresh Fusion 🌿`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Message ${c.name} on WhatsApp`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground hover:border-[#25D366]/50 hover:text-[#128C4A]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Message
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
