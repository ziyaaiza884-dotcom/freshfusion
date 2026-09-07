import { NextResponse } from "next/server";
import { createGatewayOrder, paymentsKeyId } from "@/server/payments/gateway";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { amount?: unknown; receipt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 422 });
  }

  const receipt =
    typeof body.receipt === "string" && body.receipt
      ? body.receipt
      : `rcpt_${Date.now()}`;

  try {
    const order = await createGatewayOrder({ amount, receipt });
    return NextResponse.json({
      gatewayOrder: order,
      keyId: paymentsKeyId(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gateway error" },
      { status: 502 },
    );
  }
}
