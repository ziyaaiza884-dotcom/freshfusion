import { NextResponse } from "next/server";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { markPaymentCollected, setOrderStatus } from "@/server/store";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: { status?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "collect_payment") {
      const order = await markPaymentCollected(id);
      return NextResponse.json({ order });
    }

    if (body.status && body.status in ORDER_STATUS_LABELS) {
      const order = await setOrderStatus(id, body.status as OrderStatus);
      return NextResponse.json({ order });
    }

    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 422 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
