"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY_PER_LINE } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_QTY_PER_LINE,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "h-9" : "h-11";
  const btn = size === "sm" ? "w-9" : "w-11";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface",
        dim,
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          "grid h-full place-items-center rounded-l-md text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40",
          btn,
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          "grid h-full place-items-center rounded-r-md text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40",
          btn,
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
