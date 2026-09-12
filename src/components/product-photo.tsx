"use client";

import Image from "next/image";
import type { Category } from "@/data/types";
import { useProductPhoto } from "@/context/product-photos-context";
import { ProductArt } from "@/components/product-art";
import { cn } from "@/lib/utils";

/**
 * Renders a product's admin-uploaded photo if one exists, falling back to
 * the gradient placeholder art otherwise. Drop-in replacement for
 * <ProductArt> everywhere a specific product's slug is known.
 */
export function ProductPhoto({
  slug,
  art,
  category,
  className,
  label,
}: {
  slug: string;
  art: string;
  category: Category;
  className?: string;
  label?: string;
}) {
  const photo = useProductPhoto(slug);

  if (!photo) {
    return (
      <ProductArt art={art} category={category} className={className} label={label} />
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[inherit]", className)}>
      <Image
        src={photo}
        alt={label ?? `${category} product photo`}
        fill
        sizes="(max-width: 640px) 50vw, 320px"
        className={cn("object-cover", className)}
      />
    </div>
  );
}
