import { NextResponse } from "next/server";
import { findCustomerByEmail } from "@/server/store";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_COOKIE_MAX_AGE,
  customerToken,
  hashPassword,
} from "@/lib/customer-auth";
import { toPublicCustomer } from "@/lib/customers";

export const runtime = "nodejs";

const WRONG_CREDENTIALS = "Wrong email or password";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: WRONG_CREDENTIALS }, { status: 401 });
  }

  const customer = await findCustomerByEmail(email);
  if (!customer) {
    return NextResponse.json({ error: WRONG_CREDENTIALS }, { status: 401 });
  }

  const hash = await hashPassword(password, customer.salt);
  if (hash !== customer.passwordHash) {
    return NextResponse.json({ error: WRONG_CREDENTIALS }, { status: 401 });
  }

  const res = NextResponse.json({ customer: toPublicCustomer(customer) });
  res.cookies.set(CUSTOMER_COOKIE, await customerToken(customer.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
