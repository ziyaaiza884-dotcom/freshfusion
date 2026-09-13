import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, OrderError, type CreateOrderInput } from "@/server/store";
import { CUSTOMER_COOKIE, verifyCustomerToken } from "@/lib/customer-auth";

export const runtime = "nodejs";

const PAYMENT_METHODS = new Set(["cod", "card", "upi", "wallet"]);

function validate(body: unknown): { ok: true } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.items) || b.items.length === 0)
    return { ok: false, error: "Cart is empty" };
  if (typeof b.totals !== "object" || typeof b.customer !== "object" || typeof b.address !== "object")
    return { ok: false, error: "Missing order fields" };

  const p = b.payment as Record<string, unknown> | undefined;
  if (!p || !PAYMENT_METHODS.has(String(p.method)))
    return { ok: false, error: "Unknown payment method" };
  if (p.method !== "cod") {
    if (!p.gatewayOrderId || !p.paymentId || !p.signature)
      return { ok: false, error: "Missing payment confirmation" };
  }
  return { ok: true };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const check = validate(body);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 422 });
  }

  try {
    // never trust a client-sent customerId — resolve it from the signed
    // session cookie instead, so an order can't be attributed to someone
    // else's account
    const jar = await cookies();
    const customerId = await verifyCustomerToken(jar.get(CUSTOMER_COOKIE)?.value);
    const order = await createOrder({
      ...(body as CreateOrderInput),
      customerId: customerId ?? undefined,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      const status = err.code === "payment_failed" ? 402 : 409;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Could not place the order" },
      { status: 500 },
    );
  }
}
