import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerById, getOrdersForCustomer } from "@/server/store";
import { CUSTOMER_COOKIE, verifyCustomerToken } from "@/lib/customer-auth";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const customerId = await verifyCustomerToken(jar.get(CUSTOMER_COOKIE)?.value);
  if (!customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const customer = await getCustomerById(customerId);
  if (!customer) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const orders = await getOrdersForCustomer(customerId, customer.email);
  return NextResponse.json({ orders });
}
