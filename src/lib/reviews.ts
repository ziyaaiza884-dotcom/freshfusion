export interface Review {
  id: string;
  productSlug: string;
  author: string;
  /** integer 1..5 */
  rating: number;
  title?: string;
  body: string;
  /** matched a real order containing this product at submit time */
  verified: boolean;
  /** hidden by an admin */
  hidden: boolean;
  createdAt: string;
}

export interface RatingSummary {
  average: number; // one decimal place
  count: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const clampRating = (n: number) =>
  Math.max(1, Math.min(5, Math.round(n)));

export function visibleReviews(
  reviews: Review[],
  slug?: string,
): Review[] {
  return reviews
    .filter((r) => !r.hidden && (slug ? r.productSlug === slug : true))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function ratingSummary(
  reviews: Review[],
  slug: string,
): RatingSummary {
  const forProduct = reviews.filter(
    (r) => !r.hidden && r.productSlug === slug,
  );
  const breakdown: RatingSummary["breakdown"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const r of forProduct) {
    const k = clampRating(r.rating) as 1 | 2 | 3 | 4 | 5;
    breakdown[k] += 1;
    total += k;
  }
  const count = forProduct.length;
  return {
    average: count ? Math.round((total / count) * 10) / 10 : 0,
    count,
    breakdown,
  };
}

/** catalog-wide average of every visible review */
export function overallRating(reviews: Review[]): {
  average: number;
  count: number;
} {
  const visible = reviews.filter((r) => !r.hidden);
  if (!visible.length) return { average: 0, count: 0 };
  const total = visible.reduce((n, r) => n + clampRating(r.rating), 0);
  return {
    average: Math.round((total / visible.length) * 10) / 10,
    count: visible.length,
  };
}

export const AUTHOR_MAX = 50;
export const TITLE_MAX = 80;
export const BODY_MAX = 1500;
export const BODY_MIN = 4;

export interface ReviewDraft {
  author: string;
  rating: number;
  title?: string;
  body: string;
}

export function validateReviewDraft(
  input: unknown,
): { ok: true; value: ReviewDraft } | { ok: false; error: string } {
  if (!input || typeof input !== "object")
    return { ok: false, error: "Invalid review" };
  const b = input as Record<string, unknown>;

  const author = typeof b.author === "string" ? b.author.trim() : "";
  if (author.length < 2 || author.length > AUTHOR_MAX)
    return { ok: false, error: "Name must be 2–50 characters" };

  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { ok: false, error: "Pick a rating from 1 to 5 stars" };

  const body = typeof b.body === "string" ? b.body.trim() : "";
  if (body.length < BODY_MIN || body.length > BODY_MAX)
    return { ok: false, error: "Review text must be 4–1500 characters" };

  const title =
    typeof b.title === "string" && b.title.trim()
      ? b.title.trim().slice(0, TITLE_MAX)
      : undefined;

  return { ok: true, value: { author: author.slice(0, AUTHOR_MAX), rating, title, body } };
}
