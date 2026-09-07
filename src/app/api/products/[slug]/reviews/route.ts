import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addReview, getReviewsForProduct, OrderError } from "@/server/store";
import { visibleReviews } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const reviews = await getReviewsForProduct(slug);
  return NextResponse.json({ reviews: visibleReviews(reviews, slug) });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const review = await addReview({
      productSlug: slug,
      author: String(body.author ?? ""),
      rating: Number(body.rating),
      title: typeof body.title === "string" ? body.title : undefined,
      body: String(body.body ?? ""),
      orderId: typeof body.orderId === "string" ? body.orderId : undefined,
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${slug}`);
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: "Could not save the review" },
      { status: 500 },
    );
  }
}
