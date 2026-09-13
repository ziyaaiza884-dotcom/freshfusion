import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { createManualOrder, OrderError, type ManualOrderInput } from "@/server/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  let body: ManualOrderInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const order = await createManualOrder(body);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof OrderError ? err.message : "Could not create order" },
      { status: 400 },
    );
  }
}
