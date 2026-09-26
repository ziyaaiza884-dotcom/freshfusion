export interface StoredCustomer {
  id: string;
  name: string;
  /** always lower-cased before storage/lookup */
  email: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  /**
   * True only if, at signup, neither this email nor this phone number had
   * ever claimed the new-member discount before (see
   * `server/store.ts` `claimedWelcomeOffers` — a signup with a phone or
   * email that's already been used elsewhere never gets this, even under a
   * brand-new account, so one person can't re-claim it with a second
   * account).
   */
  welcomeOfferEligible: boolean;
  /** set once an order has actually used the WELCOME10 code */
  welcomeOfferUsedAt?: string;
}

/** what the client is ever allowed to see */
export type PublicCustomer = Pick<
  StoredCustomer,
  "id" | "name" | "email" | "phone" | "welcomeOfferEligible" | "welcomeOfferUsedAt"
>;

export function toPublicCustomer(c: StoredCustomer): PublicCustomer {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    welcomeOfferEligible: c.welcomeOfferEligible,
    welcomeOfferUsedAt: c.welcomeOfferUsedAt,
  };
}

/** last 10 digits, so "+91 98765 43210" and "9876543210" are the same key */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function generateCustomerId(): string {
  return `cus_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
