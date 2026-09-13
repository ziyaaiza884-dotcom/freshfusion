import { NextResponse } from "next/server";
import { createCustomer, findCustomerByEmail, OrderError } from "@/server/store";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_COOKIE_MAX_AGE,
  customerToken,
  hashPassword,
  randomSalt,
} from "@/lib/customer-auth";
import { toPublicCustomer } from "@/lib/customers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const password = body.password ?? "";

  if (!name) return NextResponse.json({ error: "Enter your name" }, { status: 422 });
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 422 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 422 },
    );
  }

  const existing = await findCustomerByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);

  try {
    const customer = await createCustomer({
      name,
      email,
      phone: phone || undefined,
      passwordHash,
      salt,
    });

    const res = NextResponse.json(
      { customer: toPublicCustomer(customer) },
      { status: 201 },
    );
    res.cookies.set(CUSTOMER_COOKIE, await customerToken(customer.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CUSTOMER_COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof OrderError ? err.message : "Could not create account" },
      { status: 400 },
    );
  }
}
