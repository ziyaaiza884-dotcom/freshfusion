/**
 * Demo-grade customer auth: salted SHA-256 password hashes and an HMAC-signed
 * session cookie (`customerId.signature`), all via Web Crypto so the same
 * code runs in middleware (edge) and route handlers (node). Good enough for
 * a demo storefront — a production build would want bcrypt/argon2 and a
 * rotate-able secret pulled from a real secrets manager.
 */
export const CUSTOMER_COOKIE = "ff_customer";
export const CUSTOMER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const SECRET = process.env.CUSTOMER_AUTH_SECRET ?? "freshfusion-demo-session-secret";

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(sig);
}

export function randomSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}::${password}`),
  );
  return toHex(digest);
}

/** signed `customerId.sig` cookie value */
export async function customerToken(customerId: string): Promise<string> {
  return `${customerId}.${await hmac(customerId)}`;
}

/** returns the customerId if the cookie is present and its signature checks out */
export async function verifyCustomerToken(
  value: string | undefined,
): Promise<string | null> {
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig) return null;
  return (await hmac(id)) === sig ? id : null;
}
