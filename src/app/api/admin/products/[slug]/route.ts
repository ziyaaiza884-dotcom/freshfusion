import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { updateProduct, type ProductPatch } from "@/server/store";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { slug } = await params;

  let body: ProductPatch;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const product = await updateProduct(slug, body);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${slug}`);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
