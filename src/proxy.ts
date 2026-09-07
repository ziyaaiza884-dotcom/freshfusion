import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";

const OPEN_API = new Set(["/api/admin/login", "/api/admin/logout"]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isValidAdminCookie(
    req.cookies.get(ADMIN_COOKIE)?.value,
  );

  if (pathname.startsWith("/api/admin/")) {
    if (OPEN_API.has(pathname)) return NextResponse.next();
    return authed
      ? NextResponse.next()
      : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // /admin pages
  if (pathname === "/admin/login") {
    return authed
      ? NextResponse.redirect(new URL("/admin", req.url))
      : NextResponse.next();
  }
  if (!authed) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
