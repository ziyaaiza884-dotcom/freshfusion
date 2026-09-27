"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { CATEGORY_LABELS, DIETARY_LABELS, type Category, type Dietary } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const DIETARIES = Object.keys(DIETARY_LABELS) as Dietary[];

const emptyForm = {
  name: "",
  category: CATEGORIES[0],
  dietary: "veg" as Dietary,
  price: "",
  weight: "",
  unit: "g" as "g" | "ml",
  stockQty: "",
  blurb: "",
};

export function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          dietary: form.dietary,
          price: Number(form.price),
          weight: Number(form.weight),
          unit: form.unit,
          stockQty: Number(form.stockQty),
          blurb: form.blurb,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Could not add product (${res.status})`);
      }
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add product");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add product
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-base font-bold">Add a new product</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Dietary">
          <select
            value={form.dietary}
            onChange={(e) => set("dietary", e.target.value as Dietary)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          >
            {DIETARIES.map((d) => (
              <option key={d} value={d}>
                {DIETARY_LABELS[d]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price ₹">
          <Input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
        </Field>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Pack size">
            <Input
              type="number"
              min={1}
              value={form.weight}
              onChange={(e) => set("weight", e.target.value)}
              required
            />
          </Field>
          <Field label="Unit">
            <select
              value={form.unit}
              onChange={(e) => set("unit", e.target.value as "g" | "ml")}
              className="h-11 rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
            </select>
          </Field>
        </div>
        <Field label="Initial stock">
          <Input
            type="number"
            min={0}
            value={form.stockQty}
            onChange={(e) => set("stockQty", e.target.value)}
            required
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Short description (optional)">
            <Textarea
              value={form.blurb}
              onChange={(e) => set("blurb", e.target.value)}
              rows={2}
            />
          </Field>
        </div>

        {error && (
          <p className="sm:col-span-2 text-sm text-accent">{error}</p>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy} className={cn("gap-1.5")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
