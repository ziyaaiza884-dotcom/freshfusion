"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { PaymentMethod } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

interface ProductOption {
  slug: string;
  name: string;
  price: number;
}

interface ItemRow {
  slug: string;
  qty: number;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on delivery" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "wallet", label: "Wallet" },
];

export function NewOrderForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { slug: products[0]?.slug ?? "", qty: 1 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setItem = (i: number, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRow = () =>
    setItems((rows) => [...rows, { slug: products[0]?.slug ?? "", qty: 1 }]);

  const removeRow = (i: number) =>
    setItems((rows) => rows.filter((_, idx) => idx !== i));

  const estimatedTotal = items.reduce((sum, row) => {
    const p = products.find((x) => x.slug === row.slug);
    return sum + (p ? p.price * row.qty : 0);
  }, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email: email || undefined },
          address: { line1: address, city },
          items: items.filter((r) => r.slug && r.qty > 0),
          paymentMethod,
          paid,
          notes,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        order?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error ?? `Could not log the order (${res.status})`);
      }
      router.push(`/admin/orders#${data.order.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log the order");
    } finally {
      setBusy(false);
    }
  };

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        No in-stock products to add — check Inventory.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="WhatsApp / phone number">
          <Input
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>
        <Field label="Email (optional)">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="City (optional)">
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
      </div>

      <Field label="Delivery address (optional)">
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-foreground">Items</span>
        <div className="space-y-2">
          {items.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={row.slug}
                onChange={(e) => setItem(i, { slug: e.target.value })}
                className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} — {formatPrice(p.price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={row.qty}
                onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                className="h-11 w-20 rounded-md border border-border bg-surface px-2 text-sm tabular-nums focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={items.length === 1}
                aria-label="Remove item"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-accent disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add another item
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment method">
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          >
            {PAYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Already paid (e.g. UPI screenshot received)
        </label>
      </div>

      <Field label="Notes (optional)">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything worth remembering about this order."
        />
      </Field>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/50 px-4 py-3">
        <span className="text-sm text-muted-foreground">Estimated total</span>
        <span className="text-lg font-semibold">{formatPrice(estimatedTotal)}</span>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log order"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
