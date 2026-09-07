import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { deleteReview, getReviews, setReviewHidden } from "@/server/store";

export const runtime = "nodejs";

async function revalidateFor(id: string) {
  const review = (await getReviews()).find((r) => r.id === id);
  revalidatePath("/");
  revalidatePath("/shop");
  if (review) revalidatePath(`/product/${review.productSlug}`);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: { hidden?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.hidden !== "boolean") {
    return NextResponse.json({ error: "`hidden` must be a boolean" }, { status: 422 });
  }

  try {
    await revalidateFor(id);
    const review = await setReviewHidden(id, body.hidden);
    revalidatePath(`/product/${review.productSlug}`);
    return NextResponse.json({ review });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await revalidateFor(id);
    const result = await deleteReview(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 400 },
    );
  }
}
