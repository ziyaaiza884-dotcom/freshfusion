import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Mock payment gateway shaped like Razorpay.
 *
 * The signature scheme is identical to Razorpay's client callback:
 *   signature = HMAC_SHA256(`${order_id}|${payment_id}`, KEY_SECRET)
 * so the server-side verification here is the same code a real integration uses.
 *
 * To swap in the real gateway: set PAYMENTS_PROVIDER=razorpay plus real
 * RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET, and implement the `razorpay` branch in
 * `createGatewayOrder` against the Razorpay Orders API.
 */

const PROVIDER = process.env.PAYMENTS_PROVIDER ?? "mock";
const KEY_ID = process.env.PAYMENTS_KEY_ID ?? "rzp_test_mock";
const KEY_SECRET = process.env.PAYMENTS_KEY_SECRET ?? "mock_secret";

export const paymentsKeyId = () => KEY_ID;
export const isMockGateway = () => PROVIDER === "mock";

export interface GatewayOrder {
  id: string;
  amount: number; // in paise, like Razorpay
  currency: "INR";
  status: "created";
  receipt: string;
}

const rand = (prefix: string) => `${prefix}_${randomBytes(10).toString("hex")}`;

export async function createGatewayOrder(input: {
  /** amount in rupees */
  amount: number;
  receipt: string;
}): Promise<GatewayOrder> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Invalid amount");
  }
  if (PROVIDER === "razorpay") {
    // TODO: call the real Razorpay Orders API with KEY_ID/KEY_SECRET.
    throw new Error("Real Razorpay provider is not wired up yet");
  }
  return {
    id: rand("order"),
    amount: Math.round(input.amount * 100),
    currency: "INR",
    status: "created",
    receipt: input.receipt,
  };
}

/** deterministic signature over the (orderId, paymentId) pair */
export function signPayment(gatewayOrderId: string, paymentId: string): string {
  return createHmac("sha256", KEY_SECRET)
    .update(`${gatewayOrderId}|${paymentId}`)
    .digest("hex");
}

export function verifySignature(
  gatewayOrderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!gatewayOrderId || !paymentId || !signature) return false;
  const expected = signPayment(gatewayOrderId, paymentId);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** mock-only: stand in for the client-side success callback from Razorpay */
export function mockCapture(gatewayOrderId: string): {
  paymentId: string;
  signature: string;
} {
  const paymentId = rand("pay");
  return { paymentId, signature: signPayment(gatewayOrderId, paymentId) };
}
