"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, RotateCcw } from "lucide-react";
import type { StockedProduct } from "@/lib/analytics";
import { CATEGORY_LABELS } from "@/data/types";
import { compressImage } from "@/lib/client-image";
import { ProductArt } from "@/components/product-art";
import { cn } from "@/lib/utils";

type RowState = {
  price: number;
  stockQty: number;
  madeOn: string;
  inStock: boolean;
};

const pick = (p: StockedProduct): RowState => ({
  price: p.price,
  stockQty: p.stockQty,
  madeOn: p.madeOn,
  inStock: p.inStock,
});

const dirty = (a: RowState, b: RowState) =>
  a.price !== b.price ||
  a.stockQty !== b.stockQty ||
  a.madeOn !== b.madeOn ||
  a.inStock !== b.inStock;

export function InventoryTable({
  products,
  photoIndex,
}: {
  products: StockedProduct[];
  /** slug -> updatedAt (ms), for products with an admin-uploaded photo */
  photoIndex: Record<string, number>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Photo</th>
            <th className="px-4 py-3 font-semibold">Product</th>
            <th className="px-4 py-3 font-semibold">Price ₹</th>
            <th className="px-4 py-3 font-semibold">Stock</th>
            <th className="px-4 py-3 font-semibold">Made on</th>
            <th className="px-4 py-3 font-semibold">In stock</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => (
            <InventoryRow
              key={p.slug}
              product={p}
              photoUpdatedAt={photoIndex[p.slug]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhotoCell({
  slug,
  art,
  category,
  updatedAt,
}: {
  slug: string;
  art: string;
  category: StockedProduct["category"];
  updatedAt: number | undefined;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(Boolean(updatedAt));
  const src = preview ?? (updatedAt ? `/api/media/product/${slug}/${updatedAt}` : null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const blob = await compressImage(file, 1000, 0.85);
      setPreview(URL.createObjectURL(blob));
      const form = new FormData();
      form.append("file", blob, "upload.jpg");
      const res = await fetch(`/api/admin/media/product/${slug}`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Upload failed (${res.status})`);
      }
      setHasPhoto(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/product/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Reset failed");
      setPreview(null);
      setHasPhoto(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail; source can be a blob: preview URL
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <ProductArt art={art} category={category} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Upload photo"
          className="grid h-6 w-6 place-items-center rounded border border-border text-muted-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
        </button>
        {hasPhoto && (
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            aria-label="Reset photo"
            className="grid h-6 w-6 place-items-center rounded border border-border text-muted-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-accent">{error}</p>}
    </div>
  );
}

function InventoryRow({
  product,
  photoUpdatedAt,
}: {
  product: StockedProduct;
  photoUpdatedAt: number | undefined;
}) {
  const router = useRouter();
  const original = pick(product);
  const [row, setRow] = useState<RowState>(original);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = dirty(row, original);
  const set = <K extends keyof RowState>(k: K, v: RowState[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Save failed (${res.status})`);
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr id={product.slug} className="scroll-mt-24 bg-surface">
      <td className="px-4 py-3">
        <PhotoCell
          slug={product.slug}
          art={product.art}
          category={product.category}
          updatedAt={photoUpdatedAt}
        />
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[product.category]}
        </p>
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={0}
          value={row.price}
          onChange={(e) => set("price", Number(e.target.value))}
          className="w-24 rounded-md border border-border bg-surface px-2 py-1.5 tabular-nums focus:border-primary focus:outline-none"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={0}
          value={row.stockQty}
          onChange={(e) => set("stockQty", Number(e.target.value))}
          className={cn(
            "w-20 rounded-md border bg-surface px-2 py-1.5 tabular-nums focus:border-primary focus:outline-none",
            row.stockQty === 0 ? "border-accent text-accent" : "border-border",
          )}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={row.madeOn}
          onChange={(e) => set("madeOn", e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1.5 focus:border-primary focus:outline-none"
        />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={row.inStock}
          aria-label={`${product.name} in stock`}
          onClick={() => set("inStock", !row.inStock)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            row.inStock ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              row.inStock ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={save}
          disabled={!isDirty || saving}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
            saved
              ? "bg-primary text-primary-foreground"
              : isDirty
                ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                : "bg-surface-muted text-muted-foreground",
          )}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-3.5 w-3.5" /> Saved
            </>
          ) : (
            "Save"
          )}
        </button>
      </td>
    </tr>
  );
}
