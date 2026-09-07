import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminCookie(jar.get(ADMIN_COOKIE)?.value);
}

/**
 * Returns a 401 response when the caller is not an admin, otherwise null.
 * Middleware already blocks the pages; this is defence-in-depth for the API.
 */
export async function denyIfNotAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
