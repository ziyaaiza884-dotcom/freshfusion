/**
 * @jest-environment node
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import { products as seed } from "@/data/catalog";
import { signPayment } from "@/server/payments/gateway";
import type { CreateOrderInput } from "./store";

let mongod: MongoMemoryServer;
let store: typeof import("./store");

const makeOrder = (
  over: Partial<CreateOrderInput> = {},
): CreateOrderInput => ({
  placedAt: new Date().toISOString(),
  items: [
    {
      slug: "lemon-pickle",
      name: "Lemon Pickle",
      price: 180,
      qty: 2,
      art: "x",
      weightLabel: "300 g",
    },
  ],
  totals: {
    count: 2,
    subtotal: 360,
    discount: 0,
    discountLabel: null,
    packaging: 25,
    delivery: 49,
    tax: 18,
    total: 452,
    freeDeliveryRemaining: 439,
  },
  customer: { name: "A", email: "a@b.com", phone: "9999999999" },
  address: { line1: "1", line2: "", pincode: "682001", city: "Kochi", state: "Kerala" },
  deliverySlot: "Tomorrow 9am",
  payment: { method: "cod" },
  giftNote: "",
  etaFrom: "Mon",
  etaTo: "Wed",
  ...over,
});

const paidWith = (method: "card" | "upi" | "wallet") => {
  const gatewayOrderId = "order_test123";
  const paymentId = "pay_test456";
  return {
    method,
    gatewayOrderId,
    paymentId,
    signature: signPayment(gatewayOrderId, paymentId),
  } as const;
};

beforeAll(async () => {
  // mongod 7.0.x — older bundled versions reject the mongodb@6 driver handshake
  mongod = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
  });
  process.env.MONGODB_URI = mongod.getUri();
  process.env.MONGODB_DB = "freshfusion_test";
}, 120_000);

afterAll(async () => {
  const mongo = await import("./mongo");
  await mongo.__resetMongo();
  await mongod.stop();
});

beforeEach(async () => {
  jest.resetModules();
  store = await import("./store");
  await store.resetStore();
}, 30_000);

describe("store seeding", () => {
  it("seeds one row per catalog product with stock", async () => {
    const products = await store.getStoreProducts();
    expect(products).toHaveLength(seed.length);
    expect(products.every((p) => typeof p.stockQty === "number")).toBe(true);
  });

  it("gives out-of-stock seed items zero stock", async () => {
    const p = await store.getStoreProduct("irimpampuli-pickle");
    expect(p?.inStock).toBe(false);
    expect(p?.stockQty).toBe(0);
  });

  it("persists a versioned state document", async () => {
    const state = await store.getStore();
    expect(state.meta.version).toBe(1);
    expect(state.settings.theme).toBe("everyday");
  });
});

describe("updateProduct", () => {
  it("patches price, stock and made-on date", async () => {
    const updated = await store.updateProduct("lemon-pickle", {
      price: 199,
      stockQty: 12,
      madeOn: "2026-09-06",
    });
    expect(updated).toMatchObject({ price: 199, stockQty: 12, madeOn: "2026-09-06" });
    const reread = await store.getStoreProduct("lemon-pickle");
    expect(reread?.price).toBe(199);
  });

  it("forces inStock=false when stock hits zero", async () => {
    const updated = await store.updateProduct("lemon-pickle", { stockQty: 0 });
    expect(updated.inStock).toBe(false);
  });

  it("re-stocks inStock=true when stock rises from zero without an explicit flag", async () => {
    await store.updateProduct("lemon-pickle", { stockQty: 0 });
    const updated = await store.updateProduct("lemon-pickle", { stockQty: 8 });
    expect(updated.inStock).toBe(true);
  });

  it("rejects an unknown slug", async () => {
    await expect(store.updateProduct("nope", { price: 1 })).rejects.toThrow();
  });
});

describe("orders", () => {
  it("creates an order with placed status, history and a generated id", async () => {
    const order = await store.createOrder(makeOrder());
    expect(order.status).toBe("placed");
    expect(order.statusHistory).toEqual([
      expect.objectContaining({ status: "placed" }),
    ]);
    expect(order.id).toMatch(/^FF-\d{4}-\d{6}$/);
  });

  it("marks a COD order payment pending with a readable method label", async () => {
    const order = await store.createOrder(makeOrder({ payment: { method: "cod" } }));
    expect(order.payment).toEqual({ method: "cod", status: "pending" });
    expect(order.paymentMethod).toBe("Cash on delivery");
  });

  it("marks a prepaid order paid when the signature verifies", async () => {
    const order = await store.createOrder(
      makeOrder({ payment: paidWith("upi") }),
    );
    expect(order.payment.status).toBe("paid");
    expect(order.payment.method).toBe("upi");
    expect(order.payment.paymentId).toBe("pay_test456");
    expect(order.payment.paidAt).toBeTruthy();
  });

  it("rejects a prepaid order with a bad signature and does not save it", async () => {
    await expect(
      store.createOrder(
        makeOrder({
          payment: {
            method: "card",
            gatewayOrderId: "order_x",
            paymentId: "pay_x",
            signature: "deadbeef",
          },
        }),
      ),
    ).rejects.toMatchObject({ code: "payment_failed" });
    expect(await store.getOrders()).toHaveLength(0);
  });

  it("ignores client-sent prices and totals, recomputing from the store", async () => {
    const order = await store.createOrder(
      makeOrder({
        items: [
          {
            slug: "lemon-pickle",
            name: "Totally Free Pickle",
            price: 1, // tampered
            qty: 2,
            art: "x",
            weightLabel: "1 g",
          },
        ],
        totals: { subtotal: 2, total: 2 },
      }),
    );
    expect(order.items[0].price).toBe(180); // real catalog price
    expect(order.items[0].name).toBe("Lemon Pickle");
    expect(order.totals.subtotal).toBe(360);
    expect(order.totals.total).toBe(452);
  });

  it("re-derives the discount from the code, not the client amount", async () => {
    const order = await store.createOrder(
      makeOrder({
        discountCode: "FRESH10",
        totals: { discount: 999 },
      }),
    );
    expect(order.totals.discount).toBe(36); // 10% of 360
  });

  it("rejects an absurd quantity", async () => {
    await expect(
      store.createOrder(
        makeOrder({
          items: [
            {
              slug: "lemon-pickle",
              name: "Lemon Pickle",
              price: 180,
              qty: 9999,
              art: "x",
              weightLabel: "300 g",
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({ code: "bad_request" });
  });

  it("rejects an order for an out-of-stock product", async () => {
    await expect(
      store.createOrder(
        makeOrder({
          items: [
            {
              slug: "irimpampuli-pickle",
              name: "Irimpampuli Pickle",
              price: 200,
              qty: 1,
              art: "x",
              weightLabel: "300 g",
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({ code: "out_of_stock" });
  });

  it("markPaymentCollected flips a pending COD order to paid, then is idempotent", async () => {
    const order = await store.createOrder(makeOrder());
    const collected = await store.markPaymentCollected(order.id);
    expect(collected.payment.status).toBe("paid");
    expect(collected.payment.paidAt).toBeTruthy();
    const again = await store.markPaymentCollected(order.id);
    expect(again.payment.status).toBe("paid");
  });

  it("back-fills payment on orders written before slice 3", async () => {
    const legacy = {
      products: seed.map((p, i) => ({ ...p, stockQty: 10 + i })),
      orders: [
        {
          id: "FF-2026-000001",
          placedAt: "2026-09-01T10:00:00.000Z",
          items: [],
          totals: { total: 100 },
          customer: { name: "L", email: "l@x.com", phone: "0" },
          address: { line1: "", line2: "", pincode: "", city: "", state: "" },
          deliverySlot: "",
          paymentMethod: "UPI",
          giftNote: "",
          etaFrom: "",
          etaTo: "",
          status: "delivered",
          statusHistory: [{ status: "delivered", at: "2026-09-01T10:00:00.000Z" }],
        },
      ],
      meta: { seededAt: "2026-09-01T00:00:00.000Z", version: 1 },
    };
    await store.__writeRawState(legacy);
    jest.resetModules();
    const fresh = await import("./store");
    const order = await fresh.getOrder("FF-2026-000001");
    expect(order?.payment).toEqual({ method: "cod", status: "paid" });
  });

  it("decrements stock for purchased lines", async () => {
    const before = await store.getStoreProduct("lemon-pickle");
    await store.createOrder(makeOrder());
    const after = await store.getStoreProduct("lemon-pickle");
    expect(after!.stockQty).toBe(before!.stockQty - 2);
  });

  it("returns orders newest first", async () => {
    const a = await store.createOrder(
      makeOrder({ placedAt: "2026-09-01T10:00:00.000Z" }),
    );
    const b = await store.createOrder(
      makeOrder({ placedAt: "2026-09-05T10:00:00.000Z" }),
    );
    const list = await store.getOrders();
    expect(list.map((o) => o.id)).toEqual([b.id, a.id]);
  });

  it("appends history only when status actually changes", async () => {
    const order = await store.createOrder(makeOrder());
    const same = await store.setOrderStatus(order.id, "placed");
    expect(same.statusHistory).toHaveLength(1);
    const moved = await store.setOrderStatus(order.id, "packing");
    expect(moved.statusHistory).toHaveLength(2);
    expect(moved.status).toBe("packing");
  });

  it("rejects an unknown status", async () => {
    const order = await store.createOrder(makeOrder());
    // @ts-expect-error deliberately bad input
    await expect(store.setOrderStatus(order.id, "teleported")).rejects.toThrow();
  });

  it("serialises concurrent writes without losing any", async () => {
    await Promise.all([
      store.createOrder(makeOrder()),
      store.createOrder(makeOrder()),
      store.createOrder(makeOrder()),
    ]);
    const list = await store.getOrders();
    expect(list).toHaveLength(3);
  });
});

describe("reviews", () => {
  const draft = {
    productSlug: "beef-pickle",
    author: "Neha K",
    rating: 5,
    body: "Genuinely the best beef pickle I have ordered online.",
  };

  it("seeds every product with at least one review", async () => {
    const reviews = await store.getReviews();
    expect(reviews.length).toBeGreaterThan(seed.length);
    for (const p of seed) {
      expect(reviews.some((r) => r.productSlug === p.slug)).toBe(true);
    }
  });

  it("adds an unverified review when no order id is given", async () => {
    const review = await store.addReview(draft);
    expect(review.verified).toBe(false);
    expect(review.hidden).toBe(false);
    const forProduct = await store.getReviewsForProduct("beef-pickle");
    expect(forProduct[0].id).toBe(review.id); // newest first
  });

  it("marks a review verified when the order id contains the product", async () => {
    const order = await store.createOrder(
      makeOrder({
        items: [
          {
            slug: "beef-pickle",
            name: "Beef Pickle",
            price: 320,
            qty: 1,
            art: "x",
            weightLabel: "250 g",
          },
        ],
      }),
    );
    const yes = await store.addReview({ ...draft, orderId: order.id });
    expect(yes.verified).toBe(true);

    const no = await store.addReview({
      ...draft,
      productSlug: "lemon-pickle",
      orderId: order.id, // that order has no lemon pickle
    });
    expect(no.verified).toBe(false);
  });

  it("rejects an invalid review", async () => {
    await expect(
      store.addReview({ ...draft, body: "no" }),
    ).rejects.toMatchObject({ code: "bad_request" });
    await expect(
      store.addReview({ ...draft, productSlug: "does-not-exist" }),
    ).rejects.toMatchObject({ code: "bad_request" });
  });

  it("hides and deletes reviews, and recomputes the product rating", async () => {
    const before = await store.getStoreProduct("cut-mango-pickle");
    // pile on five 1-star reviews
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const rv = await store.addReview({
        productSlug: "cut-mango-pickle",
        author: `Grumpy ${i}`,
        rating: 1,
        body: "Did not enjoy this one at all, sorry.",
      });
      ids.push(rv.id);
    }
    const after = await store.getStoreProduct("cut-mango-pickle");
    expect(after!.rating).toBeLessThan(before!.rating);

    await store.setReviewHidden(ids[0], true);
    const hiddenBack = (await store.getReviews()).find((r) => r.id === ids[0]);
    expect(hiddenBack?.hidden).toBe(true);

    await store.deleteReview(ids[1]);
    expect((await store.getReviews()).some((r) => r.id === ids[1])).toBe(false);
  });

  it("throws on hiding or deleting an unknown review", async () => {
    await expect(store.setReviewHidden("nope", true)).rejects.toThrow();
    await expect(store.deleteReview("nope")).rejects.toThrow();
  });
});

describe("settings", () => {
  it("seeds with the default theme", async () => {
    expect(await store.getSettings()).toEqual({ theme: "everyday" });
  });

  it("updates and persists a valid theme", async () => {
    const updated = await store.updateSettings({ theme: "diwali" });
    expect(updated.theme).toBe("diwali");
    expect((await store.getSettings()).theme).toBe("diwali");
  });

  it("rejects an unknown theme", async () => {
    await expect(
      store.updateSettings({ theme: "spooky" }),
    ).rejects.toMatchObject({ code: "bad_request" });
  });

  it("back-fills settings on a store written before this slice", async () => {
    const legacy = {
      products: seed.map((p, i) => ({ ...p, stockQty: 5 + i })),
      orders: [],
      reviews: [],
      meta: { seededAt: "2026-09-01T00:00:00.000Z", version: 1 },
    };
    await store.__writeRawState(legacy);
    jest.resetModules();
    const fresh = await import("./store");
    expect((await fresh.getSettings()).theme).toBe("everyday");
  });
});
