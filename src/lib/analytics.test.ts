import {
  aov,
  buildOverview,
  codOutstanding,
  lowStock,
  revenueBetween,
  revenueByDay,
  topSkus,
  type StockedProduct,
} from "./analytics";
import type { PaymentInfo, StoredOrder } from "@/lib/orders";

const PAID: PaymentInfo = { method: "card", status: "paid" };
const COD_DUE: PaymentInfo = { method: "cod", status: "pending" };

const line = (slug: string, name: string, price: number, qty: number) => ({
  slug,
  name,
  price,
  qty,
  art: "x",
  weightLabel: "1",
});

const order = (
  id: string,
  placedAt: string,
  total: number,
  items: ReturnType<typeof line>[],
  status: StoredOrder["status"] = "placed",
  payment: PaymentInfo = PAID,
): StoredOrder =>
  ({
    id,
    placedAt,
    items,
    totals: {
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: total,
      discount: 0,
      discountLabel: null,
      packaging: 0,
      delivery: 0,
      tax: 0,
      total,
      freeDeliveryRemaining: 0,
    },
    customer: { name: "x", email: "x@y.z", phone: "0" },
    address: { line1: "", line2: "", pincode: "", city: "", state: "" },
    deliverySlot: "",
    paymentMethod: "UPI",
    payment,
    giftNote: "",
    etaFrom: "",
    etaTo: "",
    status,
    statusHistory: [{ status, at: placedAt }],
  }) satisfies StoredOrder;

const NOW = new Date("2026-09-06T12:00:00.000Z");

const orders: StoredOrder[] = [
  order("o1", "2026-09-06T09:00:00.000Z", 500, [
    line("beef-pickle", "Beef Pickle", 250, 2),
  ]),
  order("o2", "2026-09-06T11:00:00.000Z", 300, [
    line("lemon-pickle", "Lemon Pickle", 150, 2),
  ]),
  order("o3", "2026-09-03T10:00:00.000Z", 800, [
    line("beef-pickle", "Beef Pickle", 250, 2),
    line("cardamom", "Cardamom", 300, 1),
  ]),
  order(
    "o4",
    "2026-09-05T10:00:00.000Z",
    999,
    [line("lemon-pickle", "Lemon Pickle", 150, 3)],
    "cancelled",
  ),
];

describe("revenueBetween", () => {
  it("sums totals within [from, to) and skips cancelled orders", () => {
    const rev = revenueBetween(
      orders,
      "2026-09-06T00:00:00.000Z",
      "2026-09-07T00:00:00.000Z",
    );
    expect(rev).toBe(800); // o1 + o2, not the cancelled o4
  });
});

describe("aov", () => {
  it("averages over non-cancelled orders", () => {
    expect(aov(orders)).toBe(Math.round((500 + 300 + 800) / 3));
  });
  it("is zero with no valid orders", () => {
    expect(aov([])).toBe(0);
  });
});

describe("revenueByDay", () => {
  it("returns one bucket per day, oldest first, with today last", () => {
    const days = revenueByDay(orders, 7, NOW);
    expect(days).toHaveLength(7);
    expect(days[6].date).toBe("2026-09-06");
    expect(days[6].revenue).toBe(800);
    expect(days[6].orders).toBe(2);
    expect(days[3].date).toBe("2026-09-03");
    expect(days[3].revenue).toBe(800);
  });
});

describe("topSkus", () => {
  it("ranks by quantity sold, ignoring cancelled orders", () => {
    const top = topSkus(orders);
    expect(top[0]).toMatchObject({ slug: "beef-pickle", qty: 4, revenue: 1000 });
    expect(top.find((s) => s.slug === "lemon-pickle")?.qty).toBe(2);
  });
});

describe("lowStock", () => {
  const products: StockedProduct[] = [
    { stockQty: 0 } as StockedProduct,
    { stockQty: 3 } as StockedProduct,
    { stockQty: 5 } as StockedProduct,
    { stockQty: 9 } as StockedProduct,
  ];
  it("returns items at or below the threshold, lowest first", () => {
    const low = lowStock(products, 5);
    expect(low.map((p) => p.stockQty)).toEqual([0, 3, 5]);
  });
});

describe("codOutstanding", () => {
  it("sums pending COD orders and ignores paid / cancelled ones", () => {
    const set: StoredOrder[] = [
      order("c1", "2026-09-06T09:00:00.000Z", 500, [], "placed", COD_DUE),
      order("c2", "2026-09-05T09:00:00.000Z", 300, [], "delivered", {
        method: "cod",
        status: "paid",
      }),
      order("c3", "2026-09-04T09:00:00.000Z", 200, [], "packing", COD_DUE),
      order("c4", "2026-09-03T09:00:00.000Z", 999, [], "cancelled", COD_DUE),
      order("c5", "2026-09-06T09:00:00.000Z", 400, [], "placed", PAID),
    ];
    expect(codOutstanding(set)).toEqual({ amount: 700, count: 2 });
  });
});

describe("buildOverview", () => {
  const products: StockedProduct[] = [
    { slug: "a", name: "A", stockQty: 2 } as StockedProduct,
    { slug: "b", name: "B", stockQty: 40 } as StockedProduct,
  ];
  it("assembles today / 7-day / aov / low-stock / COD together", () => {
    const o = buildOverview(orders, products, NOW);
    expect(o.revenueToday).toBe(800);
    expect(o.ordersToday).toBe(2);
    expect(o.revenue7d).toBe(1600); // o1+o2 today + o3 on the 3rd
    expect(o.aov).toBe(Math.round(1600 / 3));
    expect(o.lowStock).toHaveLength(1);
    expect(o.byDay).toHaveLength(7);
    expect(o.totalOrders).toBe(3);
    expect(o.codOutstanding).toEqual({ amount: 0, count: 0 }); // all fixtures are card
  });
});
