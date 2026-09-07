"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/types";
import { ProductCard } from "@/components/product-card";

export function ProductCarousel({
  products,
  label,
}: {
  products: Product[];
  label: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    el?.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative" aria-label={label} role="group">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => nudge(-1)}
        disabled={atStart}
        className="absolute -left-3 top-[26%] z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-0 sm:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => nudge(1)}
        disabled={atEnd}
        className="absolute -right-3 top-[26%] z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-0 sm:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <li
            key={p.slug}
            className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
          >
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
