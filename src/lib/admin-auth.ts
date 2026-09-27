/**
 * Demo-grade admin gate: one or more named admin accounts, exchanged for an
 * httpOnly cookie holding a SHA-256 token. Uses Web Crypto so the same code
 * runs in middleware (edge) and route handlers (node).
 *
 * Accounts come from two env vars (never committed to git):
 *  - ADMIN_PASSWORD: the original single shared login, username "admin".
 *  - ADMIN_USERS: optional JSON array of extra named accounts, e.g.
 *    `[{"username":"Vasil-fushion","password":"..."}]`
 */
export const ADMIN_COOKIE = "ff_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AdminUser {
  username: string;
  password: string;
}

export function getAdminUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  if (process.env.ADMIN_PASSWORD) {
    users.push({ username: "admin", password: process.env.ADMIN_PASSWORD });
  }
  if (process.env.ADMIN_USERS) {
    try {
      const extra = JSON.parse(process.env.ADMIN_USERS) as unknown;
      if (Array.isArray(extra)) {
        for (const u of extra) {
          if (
            u &&
            typeof u === "object" &&
            typeof (u as AdminUser).username === "string" &&
            typeof (u as AdminUser).password === "string"
          ) {
            users.push(u as AdminUser);
          }
        }
      }
    } catch {
      // malformed ADMIN_USERS — ignore the extra accounts, the primary
      // ADMIN_PASSWORD login still works
    }
  }
  return users;
}

export async function adminToken(
  username: string,
  password: string,
): Promise<string> {
  const data = new TextEncoder().encode(
    `freshfusion::admin::${username.toLowerCase()}::${password}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function findAdminUser(username: string): AdminUser | undefined {
  const lower = username.trim().toLowerCase();
  return getAdminUsers().find((u) => u.username.toLowerCase() === lower);
}

export async function isValidAdminCookie(
  value: string | undefined,
): Promise<boolean> {
  if (!value) return false;
  for (const user of getAdminUsers()) {
    if (value === (await adminToken(user.username, user.password))) {
      return true;
    }
  }
  return false;
}
