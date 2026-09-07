import {
  overallRating,
  ratingSummary,
  validateReviewDraft,
  visibleReviews,
  type Review,
} from "./reviews";

const r = (over: Partial<Review>): Review => ({
  id: Math.random().toString(36),
  productSlug: "beef-pickle",
  author: "Tester",
  rating: 4,
  body: "Solid pickle.",
  verified: false,
  hidden: false,
  createdAt: "2026-09-01T00:00:00.000Z",
  ...over,
});

describe("ratingSummary", () => {
  it("averages to one decimal place and counts the breakdown", () => {
    const reviews = [
      r({ rating: 5 }),
      r({ rating: 4 }),
      r({ rating: 4 }),
      r({ rating: 2 }),
    ];
    const s = ratingSummary(reviews, "beef-pickle");
    expect(s.count).toBe(4);
    expect(s.average).toBe(3.8); // 15/4
    expect(s.breakdown).toEqual({ 1: 0, 2: 1, 3: 0, 4: 2, 5: 1 });
  });

  it("ignores hidden reviews and other products", () => {
    const reviews = [
      r({ rating: 5 }),
      r({ rating: 1, hidden: true }),
      r({ rating: 1, productSlug: "lemon-pickle" }),
    ];
    const s = ratingSummary(reviews, "beef-pickle");
    expect(s.count).toBe(1);
    expect(s.average).toBe(5);
  });

  it("is all zeros when a product has no reviews", () => {
    expect(ratingSummary([], "beef-pickle")).toEqual({
      average: 0,
      count: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });
});

describe("visibleReviews", () => {
  it("drops hidden ones and sorts newest first", () => {
    const reviews = [
      r({ id: "a", createdAt: "2026-09-01T00:00:00.000Z" }),
      r({ id: "b", createdAt: "2026-09-05T00:00:00.000Z" }),
      r({ id: "c", createdAt: "2026-09-03T00:00:00.000Z", hidden: true }),
    ];
    expect(visibleReviews(reviews).map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("can filter by slug", () => {
    const reviews = [
      r({ id: "a" }),
      r({ id: "b", productSlug: "lemon-pickle" }),
    ];
    expect(visibleReviews(reviews, "lemon-pickle").map((x) => x.id)).toEqual([
      "b",
    ]);
  });
});

describe("overallRating", () => {
  it("averages every visible review across products", () => {
    const reviews = [
      r({ rating: 5, productSlug: "a" }),
      r({ rating: 3, productSlug: "b" }),
      r({ rating: 1, hidden: true, productSlug: "c" }),
    ];
    expect(overallRating(reviews)).toEqual({ average: 4, count: 2 });
  });
});

describe("validateReviewDraft", () => {
  const base = { author: "Neha", rating: 4, body: "Really good, will buy again." };

  it("accepts a well-formed draft", () => {
    const res = validateReviewDraft(base);
    expect(res.ok).toBe(true);
  });

  it("rejects a short name", () => {
    expect(validateReviewDraft({ ...base, author: "N" }).ok).toBe(false);
  });

  it("rejects a non 1-5 rating", () => {
    expect(validateReviewDraft({ ...base, rating: 0 }).ok).toBe(false);
    expect(validateReviewDraft({ ...base, rating: 6 }).ok).toBe(false);
    expect(validateReviewDraft({ ...base, rating: 3.5 }).ok).toBe(false);
  });

  it("rejects an empty body", () => {
    expect(validateReviewDraft({ ...base, body: "  " }).ok).toBe(false);
  });

  it("truncates an over-long title", () => {
    const res = validateReviewDraft({ ...base, title: "x".repeat(200) });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.title!.length).toBe(80);
  });
});
