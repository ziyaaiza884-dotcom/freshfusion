import { getReviews } from "@/server/store";
import { products } from "@/data/catalog";
import { overallRating } from "@/lib/reviews";
import { ReviewsModerationTable } from "@/components/admin/reviews-moderation-table";

export const dynamic = "force-dynamic";

const NAMES = Object.fromEntries(products.map((p) => [p.slug, p.name]));

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const overall = overallRating(reviews);
  const hidden = reviews.filter((r) => r.hidden).length;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {reviews.length} review{reviews.length === 1 ? "" : "s"} ·{" "}
        {overall.average.toFixed(1)}★ average
        {hidden > 0 ? ` · ${hidden} hidden` : ""}
      </p>
      <div className="mt-6">
        <ReviewsModerationTable
          reviews={reviews}
          productNames={NAMES}
        />
      </div>
    </div>
  );
}
