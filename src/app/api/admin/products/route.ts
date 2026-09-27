import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { createProduct, type NewProductInput } from "@/server/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  let body: NewProductInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const product = await createProduct(body);
    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not add product" },
      { status: 400 },
    );
  }
}
