import { NextResponse } from "next/server";
import { isMockGateway, mockCapture } from "@/server/payments/gateway";

export const runtime = "nodejs";

/**
 * Stands in for Razorpay's client-side success callback. The real integration
 * gets { razorpay_payment_id, razorpay_signature } from the hosted Checkout
 * widget instead of calling this.
 */
export async function POST(req: Request) {
  if (!isMockGateway()) {
    return NextResponse.json(
      { error: "Mock capture is disabled" },
      { status: 404 },
    );
  }

  let body: { gatewayOrderId?: string; outcome?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.gatewayOrderId) {
    return NextResponse.json(
      { error: "gatewayOrderId required" },
      { status: 422 },
    );
  }

  if (body.outcome === "failure") {
    return NextResponse.json(
      { error: "Payment declined by the bank." },
      { status: 402 },
    );
  }

  const { paymentId, signature } = mockCapture(body.gatewayOrderId);
  return NextResponse.json({ paymentId, signature });
}
