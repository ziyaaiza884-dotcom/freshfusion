"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import type { Review } from "@/lib/reviews";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";

export function ReviewsModerationTable({
  reviews,
  productNames,
}: {
  reviews: Review[];
  productNames: Record<string, string>;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No reviews yet.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {reviews.map((r) => (
        <ReviewRow
          key={r.id}
          review={r}
          productName={productNames[r.productSlug] ?? r.productSlug}
        />
      ))}
    </div>
  );
}

function ReviewRow({
  review,
  productName,
}: {
  review: Review;
  productName: string;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(review.hidden);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState<"hide" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleHidden = async () => {
    const next = !hidden;
    setBusy("hide");
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hidden: next }),
      });
      if (!res.ok) throw new Error("Update failed");
      setHidden(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setRemoved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setBusy(null);
    }
  };

  if (removed) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-4",
        hidden && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Stars rating={review.rating} />
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {hidden && (
              <span className="rounded-full bg-[#f6e4e4] px-2 py-0.5 text-xs font-semibold text-accent">
                Hidden
              </span>
            )}
          </div>
          {review.title && (
            <p className="mt-1 text-sm font-semibold">{review.title}</p>
          )}
          <p className="mt-0.5 text-sm text-foreground/90">{review.body}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {review.author} · {productName} ·{" "}
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {error && <p className="mt-1 text-xs text-accent">{error}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleHidden}
            disabled={busy !== null}
            title={hidden ? "Show review" : "Hide review"}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-surface-muted px-3 text-xs font-semibold text-foreground hover:bg-border/70 disabled:opacity-50"
          >
            {busy === "hide" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : hidden ? (
              <>
                <Eye className="h-3.5 w-3.5" /> Show
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Hide
              </>
            )}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            title="Delete review"
            aria-label={`Delete review by ${review.author}`}
            className="inline-flex h-9 items-center rounded-md px-2 text-muted-foreground hover:bg-surface-muted hover:text-accent disabled:opacity-50"
          >
            {busy === "delete" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
