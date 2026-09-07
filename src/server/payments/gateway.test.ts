/**
 * @jest-environment node
 */
import {
  createGatewayOrder,
  mockCapture,
  signPayment,
  verifySignature,
} from "./gateway";

describe("createGatewayOrder", () => {
  it("returns a Razorpay-shaped order with amount in paise", async () => {
    const order = await createGatewayOrder({ amount: 452, receipt: "r1" });
    expect(order.id).toMatch(/^order_[0-9a-f]{20}$/);
    expect(order.amount).toBe(45200);
    expect(order.currency).toBe("INR");
    expect(order.status).toBe("created");
    expect(order.receipt).toBe("r1");
  });

  it("rejects a non-positive amount", async () => {
    await expect(
      createGatewayOrder({ amount: 0, receipt: "r" }),
    ).rejects.toThrow();
    await expect(
      createGatewayOrder({ amount: -10, receipt: "r" }),
    ).rejects.toThrow();
  });
});

describe("signature", () => {
  it("is deterministic for the same pair", () => {
    expect(signPayment("order_a", "pay_b")).toBe(signPayment("order_a", "pay_b"));
  });

  it("verifies a matching signature", () => {
    const sig = signPayment("order_a", "pay_b");
    expect(verifySignature("order_a", "pay_b", sig)).toBe(true);
  });

  it("rejects a tampered order id, payment id or signature", () => {
    const sig = signPayment("order_a", "pay_b");
    expect(verifySignature("order_X", "pay_b", sig)).toBe(false);
    expect(verifySignature("order_a", "pay_X", sig)).toBe(false);
    expect(verifySignature("order_a", "pay_b", sig.replace(/.$/, "0"))).toBe(
      false,
    );
  });

  it("rejects empty inputs", () => {
    expect(verifySignature("", "", "")).toBe(false);
    expect(verifySignature("order_a", "pay_b", "")).toBe(false);
  });
});

describe("mockCapture", () => {
  it("produces a payment id and a signature that verifies against the order", () => {
    const { paymentId, signature } = mockCapture("order_z");
    expect(paymentId).toMatch(/^pay_[0-9a-f]{20}$/);
    expect(verifySignature("order_z", paymentId, signature)).toBe(true);
    expect(verifySignature("order_other", paymentId, signature)).toBe(false);
  });
});
