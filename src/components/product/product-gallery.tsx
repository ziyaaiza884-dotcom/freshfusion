"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/data/types";
import { ProductArt } from "@/components/product-art";
import { cn } from "@/lib/utils";

/**
 * Slice 1 has no photography, so the "gallery" is the gradient art shown at
 * three crops. Hover / focus the main panel to pinch-zoom.
 */
export function ProductGallery({
  art,
  category,
  name,
}: {
  art: string;
  category: Category;
  name: string;
}) {
  const crops = ["object-center", "object-top", "object-bottom"];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  return (
    <div className="lg:sticky lg:top-24">
      <motion.div
        onHoverStart={() => setZoom(true)}
        onHoverEnd={() => setZoom(false)}
        onFocus={() => setZoom(true)}
        onBlur={() => setZoom(false)}
        tabIndex={0}
        aria-label={`${name} illustration, ${zoom ? "zoomed in" : "hover to zoom"}`}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border"
      >
        <motion.div
          animate={{ scale: zoom ? 1.18 : 1 }}
          transition={{ duration: 0.4 }}
          className="h-full w-full"
        >
          <ProductArt
            art={art}
            category={category}
            className={cn("h-full w-full", crops[active])}
            label={`${name} — illustration`}
          />
        </motion.div>
      </motion.div>

      <div className="mt-4 flex gap-3">
        {crops.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View crop ${i + 1}`}
            aria-current={i === active}
            className={cn(
              "aspect-square w-20 overflow-hidden rounded-xl border-2 transition-colors",
              i === active ? "border-primary" : "border-border",
            )}
          >
            <ProductArt art={art} category={category} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
