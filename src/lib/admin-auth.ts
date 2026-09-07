/**
 * Demo-grade admin gate: one shared password (ADMIN_PASSWORD) exchanged for an
 * httpOnly cookie holding a SHA-256 token. Uses Web Crypto so the same code
 * runs in middleware (edge) and route handlers (node).
 */
export const ADMIN_COOKIE = "ff_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`freshfusion::admin::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAdminCookie(
  value: string | undefined,
): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !value) return false;
  return value === (await adminToken(password));
}
