export interface StoredCustomer {
  id: string;
  name: string;
  /** always lower-cased before storage/lookup */
  email: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

/** what the client is ever allowed to see */
export type PublicCustomer = Pick<StoredCustomer, "id" | "name" | "email" | "phone">;

export function toPublicCustomer(c: StoredCustomer): PublicCustomer {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone };
}

export function generateCustomerId(): string {
  return `cus_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
