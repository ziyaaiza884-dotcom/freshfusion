import {
  cartReducer,
  computeTotals,
  emptyCart,
  MAX_QTY_PER_LINE,
  type CartState,
} from "./cart";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PACKAGING_FEE,
} from "./format";
import { products, getProduct } from "@/data/catalog";

const beef = getProduct("beef-pickle")!;
const lemon = getProduct("lemon-pickle")!;

const run = (state: CartState, ...actions: Parameters<typeof cartReducer>[1][]) =>
  actions.reduce((s, a) => cartReducer(s, a), state);

describe("cartReducer", () => {
  it("adds a new line with the requested quantity", () => {
    const s = run(emptyCart, { type: "add", product: beef, qty: 2 });
    expect(s.items).toHaveLength(1);
    expect(s.items[0]).toMatchObject({ slug: "beef-pickle", qty: 2 });
  });

  it("merges quantity when the same product is added again", () => {
    const s = run(
      emptyCart,
      { type: "add", product: beef, qty: 2 },
      { type: "add", product: beef, qty: 3 },
    );
    expect(s.items).toHaveLength(1);
    expect(s.items[0].qty).toBe(5);
  });

  it("clamps quantity to the per-line maximum", () => {
    const s = run(emptyCart, { type: "add", product: beef, qty: 99 });
    expect(s.items[0].qty).toBe(MAX_QTY_PER_LINE);
  });

  it("removes the line when quantity is set to zero", () => {
    const s = run(
      emptyCart,
      { type: "add", product: beef },
      { type: "setQty", slug: "beef-pickle", qty: 0 },
    );
    expect(s.items).toHaveLength(0);
  });

  it("moves a line to saved-for-later and back", () => {
    const added = run(emptyCart, { type: "add", product: beef, qty: 2 });
    const saved = cartReducer(added, {
      type: "saveForLater",
      slug: "beef-pickle",
    });
    expect(saved.items).toHaveLength(0);
    expect(saved.savedForLater).toHaveLength(1);

    const restored = cartReducer(saved, {
      type: "moveToCart",
      slug: "beef-pickle",
    });
    expect(restored.items[0].qty).toBe(2);
    expect(restored.savedForLater).toHaveLength(0);
  });

  it("stores a packer note per line", () => {
    const s = run(
      emptyCart,
      { type: "add", product: beef },
      { type: "setNote", slug: "beef-pickle", note: "less salt" },
    );
    expect(s.items[0].note).toBe("less salt");
  });

  it("clears everything", () => {
    const s = run(
      emptyCart,
      { type: "add", product: beef },
      { type: "applyDiscount", code: "FRESH10" },
      { type: "clear" },
    );
    expect(s).toEqual(emptyCart);
  });
});

describe("computeTotals", () => {
  it("is all zeros for an empty cart", () => {
    const t = computeTotals(emptyCart);
    expect(t).toMatchObject({ count: 0, subtotal: 0, total: 0, delivery: 0 });
  });

  it("charges delivery below the free-delivery threshold", () => {
    const s = run(emptyCart, { type: "add", product: lemon, qty: 1 }); // 180
    const t = computeTotals(s);
    expect(t.subtotal).toBe(lemon.price);
    expect(t.delivery).toBe(DELIVERY_FEE);
    expect(t.freeDeliveryRemaining).toBe(FREE_DELIVERY_THRESHOLD - lemon.price);
    expect(t.total).toBe(lemon.price + PACKAGING_FEE + DELIVERY_FEE);
  });

  it("waives delivery once the subtotal clears the threshold", () => {
    const s = run(emptyCart, { type: "add", product: beef, qty: 3 }); // 960
    const t = computeTotals(s);
    expect(t.delivery).toBe(0);
    expect(t.freeDeliveryRemaining).toBe(0);
  });

  it("applies the FRESH10 coupon before delivery", () => {
    const s = run(
      emptyCart,
      { type: "add", product: lemon, qty: 2 }, // 360
      { type: "applyDiscount", code: "FRESH10" },
    );
    const t = computeTotals(s);
    expect(t.discount).toBe(36);
    expect(t.discountLabel).toBe("10% off");
    const discountedSub = 360 - 36;
    expect(t.tax).toBe(0);
    expect(t.total).toBe(discountedSub + PACKAGING_FEE + DELIVERY_FEE);
  });

  it("ignores an unknown coupon code", () => {
    const s = run(
      emptyCart,
      { type: "add", product: lemon },
      { type: "applyDiscount", code: "NOPE" },
    );
    expect(computeTotals(s).discount).toBe(0);
  });
});

it("every catalog product has a unique slug", () => {
  const slugs = products.map((p) => p.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});
