import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerById } from "@/server/store";
import { CUSTOMER_COOKIE, verifyCustomerToken } from "@/lib/customer-auth";
import { toPublicCustomer } from "@/lib/customers";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const customerId = await verifyCustomerToken(jar.get(CUSTOMER_COOKIE)?.value);
  if (!customerId) return NextResponse.json({ customer: null });

  const customer = await getCustomerById(customerId);
  if (!customer) return NextResponse.json({ customer: null });

  return NextResponse.json({ customer: toPublicCustomer(customer) });
}
