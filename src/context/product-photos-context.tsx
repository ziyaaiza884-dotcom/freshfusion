"use client";

import { createContext, useContext, useEffect, useState } from "react";

/** slug -> updatedAt (ms). Populated once from GET /api/product-photos. */
type PhotoIndex = Record<string, number>;

const ProductPhotosContext = createContext<PhotoIndex>({});

export function ProductPhotosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<PhotoIndex>({});

  useEffect(() => {
    let alive = true;
    fetch("/api/product-photos", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: PhotoIndex) => {
        if (alive) setIndex(data);
      })
      .catch(() => {
        /* no custom photos is a fine default */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ProductPhotosContext.Provider value={index}>
      {children}
    </ProductPhotosContext.Provider>
  );
}

/** returns the versioned photo URL for a product slug, or undefined if it
 *  has no admin-uploaded photo (caller should fall back to placeholder art) */
export function useProductPhoto(slug: string): string | undefined {
  const index = useContext(ProductPhotosContext);
  const updatedAt = index[slug];
  return updatedAt ? `/api/media/product/${slug}/${updatedAt}` : undefined;
}
