import { cn } from "@/lib/utils";
import type { Category } from "@/data/types";

/**
 * Hand-drawn-feel placeholder art. No photography in slice 1 — each product
 * gets a warm gradient panel with a simple line-drawn jar / spice glyph.
 */

function JarGlyph() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 15h18l-1.5 5H24.5z" />
      <path d="M25 20h14a4 4 0 0 1 4 4v22a5 5 0 0 1-5 5H26a5 5 0 0 1-5-5V24a4 4 0 0 1 4-4Z" />
      <path d="M22 32h20" />
      <path d="M28 26c2 1.5 6 1.5 8 0" opacity={0.7} />
      <path d="M27 40c3 2 7 2 10 0" opacity={0.7} />
    </g>
  );
}

function SpiceGlyph() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 14c6 6 9 12 9 19a9 9 0 1 1-18 0c0-7 3-13 9-19Z" />
      <path d="M32 24v14" opacity={0.7} />
      <path d="M32 30c-2-1.5-3.5-3-4-5M32 34c2-1.5 3.5-3 4-5" opacity={0.6} />
    </g>
  );
}

function LeafGlyph() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 44c0-14 10-24 24-26-2 14-12 24-24 26Z" />
      <path d="M24 40c6-6 12-12 16-18" opacity={0.6} />
    </g>
  );
}

const glyphFor = (category: Category) =>
  category === "spices" ? (
    <SpiceGlyph />
  ) : category === "specialty" ? (
    <LeafGlyph />
  ) : (
    <JarGlyph />
  );

export function ProductArt({
  art,
  category,
  className,
  label,
}: {
  art: string;
  category: Category;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label ?? `${category} illustration`}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-[inherit] bg-gradient-to-br text-white/90",
        art,
        className,
      )}
    >
      {/* soft paper grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #fff 0, transparent 45%), radial-gradient(circle at 80% 60%, #fff 0, transparent 40%)",
        }}
      />
      <svg
        viewBox="0 0 64 64"
        className="h-[46%] w-[46%] drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
        aria-hidden
      >
        {glyphFor(category)}
      </svg>
    </div>
  );
}
