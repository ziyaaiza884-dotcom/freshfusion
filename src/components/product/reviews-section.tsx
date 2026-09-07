"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Loader2, Star } from "lucide-react";
import {
  BODY_MAX,
  ratingSummary,
  visibleReviews,
  type Review,
} from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";

const ORDERS_KEY = "freshfusion.orders.v1";

/** find a local order that contains this product, to mark the review verified */
function localOrderIdFor(slug: string): string | null {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<
      string,
      { id: string; items?: { slug: string }[] }
    >;
    for (const o of Object.values(all)) {
      if (o.items?.some((l) => l.slug === slug)) return o.id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function ReviewsSection({
  slug,
  initialReviews,
}: {
  slug: string;
  initialReviews: Review[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [limit, setLimit] = useState(5);

  const summary = useMemo(() => ratingSummary(reviews, slug), [reviews, slug]);
  const list = useMemo(() => visibleReviews(reviews, slug), [reviews, slug]);

  const onCreated = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
    setShowForm(false);
    router.refresh();
  };

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <div>
          <h2 className="font-serif text-xl font-bold">Ratings &amp; reviews</h2>
          {summary.count > 0 ? (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold">
                  {summary.average.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
              <Stars rating={summary.average} className="mt-1" />
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.count} review{summary.count === 1 ? "" : "s"}
              </p>
              <ul className="mt-4 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((n) => {
                  const pct = summary.count
                    ? Math.round((summary.breakdown[n] / summary.count) * 100)
                    : 0;
                  return (
                    <li key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-8 tabular-nums text-muted-foreground">
                        {n}★
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className="block h-full rounded-full bg-spice"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-6 text-right tabular-nums text-muted-foreground">
                        {summary.breakdown[n]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No reviews yet — be the first.
            </p>
          )}

          {!showForm && (
            <Button
              variant="outline"
              className="mt-5 w-full"
              onClick={() => setShowForm(true)}
            >
              Write a review
            </Button>
          )}
        </div>

        <div>
          <AnimatePresence initial={false}>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ReviewForm
                  slug={slug}
                  onCancel={() => setShowForm(false)}
                  onCreated={onCreated}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {list.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground">
              Nothing here yet.
            </p>
          )}

          <ul className="divide-y divide-border">
            {list.slice(0, limit).map((r) => (
              <li key={r.id} className="py-5">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
                    </span>
                  )}
                </div>
                {r.title && (
                  <p className="mt-1.5 font-semibold">{r.title}</p>
                )}
                <p className="mt-1 text-sm text-foreground/90">{r.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {r.author} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>

          {list.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + 5)}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Show more reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({
  slug,
  onCancel,
  onCreated,
}: {
  slug: string;
  onCancel: () => void;
  onCreated: (r: Review) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = useMemo(() => localOrderIdFor(slug), [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Pick a star rating.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          author,
          rating,
          title: title || undefined,
          body,
          orderId: orderId ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        review?: Review;
        error?: string;
      };
      if (!res.ok || !data.review) {
        throw new Error(data.error ?? "Could not save your review");
      }
      onCreated(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your review");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-xl border border-border bg-surface p-5"
    >
      <p className="font-serif text-lg font-bold">Write a review</p>
      {orderId && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
          <BadgeCheck className="h-3.5 w-3.5" />
          You bought this — your review will show a Verified badge
        </p>
      )}

      <div
        className="mt-4 flex items-center gap-1"
        role="radiogroup"
        aria-label="Your rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hover || rating) >= n
                  ? "fill-spice text-spice"
                  : "fill-border/50 text-border/50",
              )}
            />
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        <Input
          required
          aria-label="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          maxLength={50}
        />
        <Input
          aria-label="Headline (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline (optional)"
          maxLength={80}
        />
        <Textarea
          required
          aria-label="Your review"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you think? How did you use it?"
          maxLength={BODY_MAX}
          className="min-h-[110px]"
        />
      </div>

      {error && <p className="mt-2 text-xs text-accent">{error}</p>}

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post review"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
