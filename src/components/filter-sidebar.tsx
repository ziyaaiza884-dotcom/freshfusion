"use client";

import { RotateCcw } from "lucide-react";
import type { Category, Dietary } from "@/data/types";
import { CATEGORY_LABELS, DIETARY_LABELS } from "@/data/types";
import { PRICE_BOUNDS } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import type { ProductFilters } from "@/lib/filters";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = ["pickles", "spices", "pulses", "rice", "specialty"];
const DIETARY: Dietary[] = ["veg", "nonveg"];

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  resultCount,
  className,
}: {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
  onReset: () => void;
  resultCount: number;
  className?: string;
}) {
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const price = filters.maxPrice ?? PRICE_BOUNDS.max;

  return (
    <aside className={cn("space-y-7", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <FilterGroup title="Category">
        {CATEGORIES.map((c) => (
          <Check
            key={c}
            label={CATEGORY_LABELS[c]}
            checked={filters.categories.includes(c)}
            onChange={() =>
              onChange({ categories: toggle(filters.categories, c) })
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Dietary">
        {DIETARY.map((d) => (
          <Check
            key={d}
            label={DIETARY_LABELS[d]}
            checked={filters.dietary.includes(d)}
            onChange={() => onChange({ dietary: toggle(filters.dietary, d) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <input
          type="range"
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={10}
          value={price}
          onChange={(e) =>
            onChange({
              maxPrice:
                Number(e.target.value) >= PRICE_BOUNDS.max
                  ? null
                  : Number(e.target.value),
            })
          }
          className="w-full accent-[var(--primary)]"
          aria-label="Maximum price"
        />
        <p className="text-xs text-muted-foreground">
          Up to <span className="font-semibold text-foreground">{formatPrice(price)}</span>
        </p>
      </FilterGroup>

      <FilterGroup title="Highlights">
        <Check
          label="New arrivals"
          checked={filters.onlyNew}
          onChange={() => onChange({ onlyNew: !filters.onlyNew })}
        />
        <Check
          label="Best-selling"
          checked={filters.onlyBestSelling}
          onChange={() =>
            onChange({ onlyBestSelling: !filters.onlyBestSelling })
          }
        />
        <Check
          label="In stock only"
          checked={filters.inStockOnly}
          onChange={() => onChange({ inStockOnly: !filters.inStockOnly })}
        />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border accent-[var(--primary)]"
      />
      <span className={cn(checked ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </label>
  );
}
