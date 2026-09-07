import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`Rated ${rating} out of 5${count ? ` from ${count} reviews` : ""}`}
    >
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i <= rounded
                ? "fill-spice text-spice"
                : "fill-border/60 text-border/60",
            )}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
        {count != null && <span className="ml-0.5">({count})</span>}
      </span>
    </span>
  );
}
