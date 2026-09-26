import { festivalFor } from "@/lib/festivals";

/**
 * Thin announcement bar above the navbar, shown only when the active
 * festival config defines one (see lib/festivals.ts `offerStrip`). Renders
 * nothing on the plain "everyday" storefront or a festival without a strip.
 */
export function OfferStrip({ themeId }: { themeId: string }) {
  const festival = festivalFor(themeId);
  if (!festival?.offerStrip) return null;

  return (
    <div className="bg-accent px-4 py-1.5 text-center text-xs font-semibold text-accent-foreground sm:text-sm">
      {festival.offerStrip}
    </div>
  );
}
