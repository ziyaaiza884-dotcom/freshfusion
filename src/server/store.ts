import "server-only";
import { getDb } from "@/server/mongo";
import { products as seedProducts } from "@/data/catalog";
import type { Product } from "@/data/types";
import {
  etaWindow,
  generateOrderId,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type PaymentInfo,
  type PaymentMethod,
  type PlacedOrder,
  type StoredOrder,
} from "@/lib/orders";
import {
  computeTotals,
  emptyCart,
  MAX_QTY_PER_LINE,
  type CartLine,
} from "@/lib/cart";
import {
  ratingSummary,
  validateReviewDraft,
  type Review,
} from "@/lib/reviews";
import { seedReviews } from "@/data/seed-reviews";
import { DEFAULT_THEME_ID, isThemeId } from "@/lib/themes";
import { verifySignature } from "@/server/payments/gateway";
import { isMediaKey, type MediaItem, type MediaKey, type MediaMap } from "@/lib/media";
import type { StoredCustomer } from "@/lib/customers";

export interface StoreProduct extends Product {
  /** units on hand; the storefront still gates on `inStock` */
  stockQty: number;
}

export interface StoreSettings {
  /** active storefront theme id (see src/lib/themes.ts) */
  theme: string;
}

export interface Store {
  products: StoreProduct[];
  orders: StoredOrder[];
  reviews: Review[];
  settings: StoreSettings;
  /** admin-uploaded homepage imagery, keyed by MediaKey; see src/lib/media.ts */
  media: MediaMap;
  /** admin-uploaded per-product photos, keyed by product slug */
  productPhotos: Record<string, MediaItem>;
  /** registered customer accounts (email + password login) */
  customers: StoredCustomer[];
  meta: { seededAt: string; version: number };
}

const defaultSettings = (): StoreSettings => ({ theme: DEFAULT_THEME_ID });

const STORE_VERSION = 1;

/** the whole store lives as one document so all the pure logic below is unchanged */
const STATE_COLLECTION = "state";
const STATE_ID = "singleton";

async function stateCollection() {
  const db = await getDb();
  return db.collection<{ _id: string } & Record<string, unknown>>(
    STATE_COLLECTION,
  );
}

/** deterministic-ish starting stock so the demo looks lived-in */
function seedStock(p: Product, i: number): number {
  if (!p.inStock) return 0;
  return 6 + ((i * 7 + p.name.length) % 34); // 6..39
}

function seed(): Store {
  return {
    products: seedProducts.map((p, i) => ({ ...p, stockQty: seedStock(p, i) })),
    orders: [],
    reviews: seedReviews(),
    settings: defaultSettings(),
    media: {},
    productPhotos: {},
    customers: [],
    meta: { seededAt: new Date().toISOString(), version: STORE_VERSION },
  };
}

async function persist(store: Store): Promise<void> {
  const col = await stateCollection();
  await col.replaceOne(
    { _id: STATE_ID },
    { ...store, _id: STATE_ID },
    { upsert: true },
  );
}

function normalise(store: Store): Store {
  store.orders = (store.orders ?? []).map(migrateOrder);
  if (!Array.isArray(store.reviews)) store.reviews = seedReviews();
  // back-fill any catalog products added after this store's document was
  // first seeded (e.g. new categories) without touching existing products'
  // admin-edited price/stock/inStock values
  const known = new Set(store.products.map((p) => p.slug));
  const missing = seedProducts.filter((p) => !known.has(p.slug));
  if (missing.length) {
    const startIndex = store.products.length;
    store.products.push(
      ...missing.map((p, i) => ({ ...p, stockQty: seedStock(p, startIndex + i) })),
    );
  }
  if (!store.settings || !isThemeId(store.settings.theme)) {
    store.settings = defaultSettings();
  }
  if (!store.media || typeof store.media !== "object") {
    store.media = {};
  }
  if (!store.productPhotos || typeof store.productPhotos !== "object") {
    store.productPhotos = {};
  }
  if (!Array.isArray(store.customers)) {
    store.customers = [];
  }
  return store;
}

async function load(): Promise<Store> {
  const col = await stateCollection();
  const doc = await col.findOne({ _id: STATE_ID });

  if (
    doc &&
    (doc.meta as { version?: number })?.version === STORE_VERSION &&
    Array.isArray(doc.products) &&
    Array.isArray(doc.orders)
  ) {
    const { _id, ...rest } = doc;
    void _id;
    return normalise(rest as unknown as Store);
  }

  const fresh = seed();
  await persist(fresh);
  return fresh;
}

/**
 * Serialise every read-modify-write so two concurrent requests can't clobber
 * the JSON file. Reads go through the same queue for a consistent snapshot.
 */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

export function getStore(): Promise<Store> {
  return enqueue(load);
}

export function getSettings(): Promise<StoreSettings> {
  return getStore().then((s) => s.settings);
}

export function updateSettings(
  patch: Partial<StoreSettings>,
): Promise<StoreSettings> {
  return enqueue(async () => {
    const store = await load();
    if (patch.theme !== undefined) {
      if (!isThemeId(patch.theme)) {
        throw new OrderError("Unknown theme.", "bad_request");
      }
      store.settings.theme = patch.theme;
    }
    await persist(store);
    return store.settings;
  });
}

export function getMedia(): Promise<MediaMap> {
  return getStore().then((s) => s.media);
}

export function setMediaItem(
  key: MediaKey,
  data: string,
  contentType: string,
): Promise<MediaMap> {
  return enqueue(async () => {
    if (!isMediaKey(key)) {
      throw new OrderError("Unknown media slot.", "bad_request");
    }
    const store = await load();
    store.media[key] = { data, contentType, updatedAt: new Date().toISOString() };
    await persist(store);
    return store.media;
  });
}

export function clearMediaItem(key: MediaKey): Promise<MediaMap> {
  return enqueue(async () => {
    const store = await load();
    delete store.media[key];
    await persist(store);
    return store.media;
  });
}

/** lightweight index (slug -> updatedAt ms) for clients that just need to
 *  know which products have a custom photo, without shipping the base64
 *  bytes of every product's photo */
export function getProductPhotoIndex(): Promise<Record<string, number>> {
  return getStore().then((s) => {
    const index: Record<string, number> = {};
    for (const [slug, item] of Object.entries(s.productPhotos)) {
      index[slug] = new Date(item.updatedAt).getTime();
    }
    return index;
  });
}

export function getProductPhotoItem(
  slug: string,
): Promise<MediaItem | undefined> {
  return getStore().then((s) => s.productPhotos[slug]);
}

export function setProductPhoto(
  slug: string,
  data: string,
  contentType: string,
): Promise<MediaItem> {
  return enqueue(async () => {
    const store = await load();
    if (!store.products.some((p) => p.slug === slug)) {
      throw new OrderError("Unknown product.", "bad_request");
    }
    const item: MediaItem = { data, contentType, updatedAt: new Date().toISOString() };
    store.productPhotos[slug] = item;
    await persist(store);
    return item;
  });
}

export function clearProductPhoto(slug: string): Promise<void> {
  return enqueue(async () => {
    const store = await load();
    delete store.productPhotos[slug];
    await persist(store);
  });
}

export function findCustomerByEmail(
  email: string,
): Promise<StoredCustomer | undefined> {
  const lower = email.toLowerCase();
  return getStore().then((s) => s.customers.find((c) => c.email === lower));
}

export function getCustomerById(
  id: string,
): Promise<StoredCustomer | undefined> {
  return getStore().then((s) => s.customers.find((c) => c.id === id));
}

export function createCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  salt: string;
}): Promise<StoredCustomer> {
  return enqueue(async () => {
    const store = await load();
    const email = input.email.toLowerCase();
    if (store.customers.some((c) => c.email === email)) {
      throw new OrderError(
        "An account with this email already exists.",
        "bad_request",
      );
    }
    const customer: StoredCustomer = {
      id: `cus_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || undefined,
      passwordHash: input.passwordHash,
      salt: input.salt,
      createdAt: new Date().toISOString(),
    };
    store.customers.push(customer);
    await persist(store);
    return customer;
  });
}

/** orders belonging to a signed-in customer — matched by customerId when
 *  present (orders placed while logged in), falling back to email match so
 *  orders placed as a guest before signing up still show up. */
export function getOrdersForCustomer(
  customerId: string,
  email: string,
): Promise<StoredOrder[]> {
  const lower = email.toLowerCase();
  return getStore().then((s) =>
    [...s.orders]
      .filter(
        (o) =>
          o.customerId === customerId ||
          o.customer.email.toLowerCase() === lower,
      )
      .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt)),
  );
}

export interface CustomerReportEntry {
  key: string;
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  sources: ("web" | "whatsapp")[];
  hasAccount: boolean;
}

/** one row per real-world customer, aggregated across every order —
 *  whether placed through checkout or logged manually from WhatsApp —
 *  plus registered accounts that haven't ordered yet. */
export function getCustomerReport(): Promise<CustomerReportEntry[]> {
  return getStore().then((s) => {
    const accountsByEmail = new Map(
      s.customers.map((c) => [c.email.toLowerCase(), c]),
    );
    const map = new Map<string, CustomerReportEntry>();

    for (const o of s.orders) {
      const email = o.customer.email?.toLowerCase() || "";
      const key = email || o.customer.phone || o.id;
      const src: "web" | "whatsapp" = o.source ?? "web";
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.totals.total;
        if (new Date(o.placedAt) > new Date(existing.lastOrderAt)) {
          existing.lastOrderAt = o.placedAt;
          existing.name = o.customer.name;
        }
        if (!existing.sources.includes(src)) existing.sources.push(src);
      } else {
        map.set(key, {
          key,
          name: o.customer.name,
          phone: o.customer.phone,
          email: o.customer.email,
          orderCount: 1,
          totalSpent: o.totals.total,
          lastOrderAt: o.placedAt,
          sources: [src],
          hasAccount: accountsByEmail.has(email),
        });
      }
    }

    // registered accounts with no orders yet still show up
    for (const c of s.customers) {
      const email = c.email.toLowerCase();
      if (map.has(email)) {
        map.get(email)!.hasAccount = true;
        continue;
      }
      map.set(email, {
        key: email,
        name: c.name,
        phone: c.phone ?? "",
        email: c.email,
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: c.createdAt,
        sources: [],
        hasAccount: true,
      });
    }

    return [...map.values()].sort(
      (a, b) => +new Date(b.lastOrderAt) - +new Date(a.lastOrderAt),
    );
  });
}

/** overlay each product's rating/reviewCount with values computed from reviews */
function withComputedRatings(store: Store): StoreProduct[] {
  return store.products.map((p) => {
    const s = ratingSummary(store.reviews, p.slug);
    return s.count
      ? { ...p, rating: s.average, reviewCount: s.count }
      : { ...p, reviewCount: 0 };
  });
}

export function getStoreProducts(): Promise<StoreProduct[]> {
  return getStore().then(withComputedRatings);
}

export function getStoreProduct(
  slug: string,
): Promise<StoreProduct | undefined> {
  return getStore().then((s) =>
    withComputedRatings(s).find((p) => p.slug === slug),
  );
}

export function getReviews(): Promise<Review[]> {
  return getStore().then((s) =>
    [...s.reviews].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    ),
  );
}

export function getReviewsForProduct(slug: string): Promise<Review[]> {
  return getStore().then((s) =>
    s.reviews
      .filter((r) => r.productSlug === slug)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );
}

export interface AddReviewInput {
  productSlug: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  /** if it names a real order containing this product, the review is verified */
  orderId?: string;
}

export function addReview(input: AddReviewInput): Promise<Review> {
  return enqueue(async () => {
    const store = await load();

    if (!store.products.some((p) => p.slug === input.productSlug)) {
      throw new OrderError("Unknown product.", "bad_request");
    }
    const draft = validateReviewDraft(input);
    if (!draft.ok) throw new OrderError(draft.error, "bad_request");

    let verified = false;
    if (input.orderId) {
      const order = store.orders.find((o) => o.id === input.orderId);
      verified = Boolean(
        order?.items.some((l) => l.slug === input.productSlug),
      );
    }

    const review: Review = {
      id: `rev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      productSlug: input.productSlug,
      author: draft.value.author,
      rating: draft.value.rating,
      title: draft.value.title,
      body: draft.value.body,
      verified,
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    store.reviews.push(review);
    await persist(store);
    return review;
  });
}

export function setReviewHidden(
  id: string,
  hidden: boolean,
): Promise<Review> {
  return enqueue(async () => {
    const store = await load();
    const review = store.reviews.find((r) => r.id === id);
    if (!review) throw new Error(`Unknown review: ${id}`);
    review.hidden = hidden;
    await persist(store);
    return review;
  });
}

export function deleteReview(id: string): Promise<{ id: string }> {
  return enqueue(async () => {
    const store = await load();
    const before = store.reviews.length;
    store.reviews = store.reviews.filter((r) => r.id !== id);
    if (store.reviews.length === before)
      throw new Error(`Unknown review: ${id}`);
    await persist(store);
    return { id };
  });
}

export type ProductPatch = Partial<
  Pick<StoreProduct, "name" | "price" | "stockQty" | "inStock" | "madeOn">
>;

export function updateProduct(
  slug: string,
  patch: ProductPatch,
): Promise<StoreProduct> {
  return enqueue(async () => {
    const store = await load();
    const product = store.products.find((p) => p.slug === slug);
    if (!product) throw new Error(`Unknown product: ${slug}`);

    if (patch.name != null) {
      const name = patch.name.trim();
      if (!name) throw new Error("Product name can't be empty.");
      product.name = name;
    }
    if (patch.price != null) product.price = Math.max(0, Math.round(patch.price));
    if (patch.stockQty != null)
      product.stockQty = Math.max(0, Math.round(patch.stockQty));
    if (patch.madeOn) product.madeOn = patch.madeOn;
    if (typeof patch.inStock === "boolean") product.inStock = patch.inStock;

    // keep the two consistent when stock hits zero / comes back
    if (product.stockQty === 0) product.inStock = false;
    else if (patch.stockQty != null && patch.inStock == null)
      product.inStock = true;

    await persist(store);
    return product;
  });
}

export function getOrders(): Promise<StoredOrder[]> {
  return getStore().then((s) =>
    [...s.orders].sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt)),
  );
}

export function getOrder(id: string): Promise<StoredOrder | undefined> {
  return getStore().then((s) => s.orders.find((o) => o.id === id));
}

export type PaymentIntent =
  | { method: "cod" }
  | {
      method: PaymentMethod;
      gatewayOrderId: string;
      paymentId: string;
      signature: string;
    };

export type CreateOrderInput = Omit<
  PlacedOrder,
  "id" | "payment" | "paymentMethod" | "totals"
> & {
  payment: PaymentIntent;
  /** discount code the shopper had applied; the server re-derives the discount */
  discountCode?: string | null;
  /** client-sent totals are accepted but recomputed server-side */
  totals?: unknown;
};

export class OrderError extends Error {
  constructor(
    message: string,
    readonly code: "payment_failed" | "out_of_stock" | "empty" | "bad_request",
  ) {
    super(message);
    this.name = "OrderError";
  }
}

function resolvePayment(intent: PaymentIntent, now: string): PaymentInfo {
  if (intent.method === "cod") {
    return { method: "cod", status: "pending" };
  }
  const ok = verifySignature(
    intent.gatewayOrderId,
    intent.paymentId,
    intent.signature,
  );
  if (!ok) {
    throw new OrderError(
      "Payment could not be verified — no charge was made.",
      "payment_failed",
    );
  }
  return {
    method: intent.method,
    status: "paid",
    gatewayOrderId: intent.gatewayOrderId,
    paymentId: intent.paymentId,
    paidAt: now,
  };
}

export function createOrder(input: CreateOrderInput): Promise<StoredOrder> {
  return enqueue(async () => {
    const store = await load();
    const now = new Date().toISOString();

    // strip client-controlled fields we recompute (`items`, `totals`),
    // consume separately (`discountCode`), or never trust from the client
    // at all (`source` — a checkout order is always "web")
    const { totals: _t, discountCode: _d, items: _i, source: _s, ...rest } = input;
    void _t;
    void _d;
    void _i;
    void _s;

    if (!input.items?.length) {
      throw new OrderError("Cart is empty.", "empty");
    }

    // Rebuild every line from server-side product data — never trust the
    // client's prices, names or totals. Re-check availability at capture time.
    const lines: CartLine[] = input.items.map((line) => {
      const p = store.products.find((x) => x.slug === line.slug);
      if (!p || !p.inStock || p.stockQty <= 0) {
        throw new OrderError(
          `${p?.name ?? line.slug} is no longer available.`,
          "out_of_stock",
        );
      }
      const qty = Number(line.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
        throw new OrderError(`Invalid quantity for ${p.name}.`, "bad_request");
      }
      return {
        slug: p.slug,
        name: p.name,
        price: p.price,
        qty,
        note:
          typeof line.note === "string"
            ? line.note.slice(0, 200)
            : undefined,
        art: p.art,
        weightLabel: `${p.weight} ${p.unit}`,
      };
    });

    // authoritative totals — discount re-derived from the code, not the client
    const totals = computeTotals({
      ...emptyCart,
      items: lines,
      discountCode: input.discountCode ?? null,
    });

    const payment = resolvePayment(input.payment, now);

    let id = generateOrderId();
    while (store.orders.some((o) => o.id === id)) id = generateOrderId();

    const order: StoredOrder = {
      ...rest,
      id,
      items: lines,
      totals,
      placedAt: input.placedAt || now,
      paymentMethod: PAYMENT_METHOD_LABELS[input.payment.method],
      payment,
      source: "web",
      status: "placed",
      statusHistory: [{ status: "placed", at: now }],
    };

    for (const line of order.items) {
      const p = store.products.find((x) => x.slug === line.slug);
      if (p) {
        p.stockQty = Math.max(0, p.stockQty - line.qty);
        if (p.stockQty === 0) p.inStock = false;
      }
    }
    store.orders.push(order);
    await persist(store);
    return order;
  });
}

export interface ManualOrderInput {
  customer: { name: string; phone: string; email?: string };
  address?: Partial<PlacedOrder["address"]>;
  items: { slug: string; qty: number }[];
  paymentMethod: PaymentMethod;
  /** admin is confirming payment already happened (e.g. UPI over WhatsApp) */
  paid: boolean;
  notes?: string;
}

/** logs an order an admin took over WhatsApp (or in person) — same stock
 *  and totals handling as a normal checkout, but skipping the cart/gateway
 *  flow since the admin is entering it directly. */
export function createManualOrder(input: ManualOrderInput): Promise<StoredOrder> {
  return enqueue(async () => {
    const store = await load();
    const now = new Date().toISOString();

    const name = input.customer?.name?.trim();
    const phone = input.customer?.phone?.trim();
    if (!name) throw new OrderError("Customer name is required.", "bad_request");
    if (!phone) throw new OrderError("Customer phone is required.", "bad_request");
    if (!input.items?.length) throw new OrderError("Add at least one item.", "empty");

    const lines: CartLine[] = input.items.map((line) => {
      const p = store.products.find((x) => x.slug === line.slug);
      if (!p) throw new OrderError(`Unknown product: ${line.slug}`, "bad_request");
      const qty = Number(line.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
        throw new OrderError(`Invalid quantity for ${p.name}.`, "bad_request");
      }
      return {
        slug: p.slug,
        name: p.name,
        price: p.price,
        qty,
        art: p.art,
        weightLabel: `${p.weight} ${p.unit}`,
      };
    });

    const totals = computeTotals({ ...emptyCart, items: lines, discountCode: null });
    const eta = etaWindow();

    let id = generateOrderId();
    while (store.orders.some((o) => o.id === id)) id = generateOrderId();

    const order: StoredOrder = {
      id,
      placedAt: now,
      items: lines,
      totals,
      customer: { name, phone, email: input.customer.email?.trim() ?? "" },
      address: {
        line1: input.address?.line1 ?? "",
        line2: input.address?.line2 ?? "",
        pincode: input.address?.pincode ?? "",
        city: input.address?.city ?? "",
        state: input.address?.state ?? "",
      },
      deliverySlot: "Arranged over WhatsApp",
      paymentMethod: PAYMENT_METHOD_LABELS[input.paymentMethod],
      payment: {
        method: input.paymentMethod,
        status: input.paid ? "paid" : "pending",
        ...(input.paid ? { paidAt: now } : {}),
      },
      giftNote: input.notes?.trim() ?? "",
      etaFrom: eta.from,
      etaTo: eta.to,
      source: "whatsapp",
      status: "placed",
      statusHistory: [{ status: "placed", at: now }],
    };

    for (const line of order.items) {
      const p = store.products.find((x) => x.slug === line.slug);
      if (p) {
        p.stockQty = Math.max(0, p.stockQty - line.qty);
        if (p.stockQty === 0) p.inStock = false;
      }
    }
    store.orders.push(order);
    await persist(store);
    return order;
  });
}

export function markPaymentCollected(id: string): Promise<StoredOrder> {
  return enqueue(async () => {
    const store = await load();
    const order = store.orders.find((o) => o.id === id);
    if (!order) throw new Error(`Unknown order: ${id}`);
    if (order.payment.method !== "cod" || order.payment.status === "paid") {
      return order;
    }
    order.payment = {
      ...order.payment,
      status: "paid",
      paidAt: new Date().toISOString(),
    };
    await persist(store);
    return order;
  });
}

/** back-fill fields on orders written before they existed */
function migrateOrder(o: StoredOrder): StoredOrder {
  if (o.payment) {
    if (o.source) return o;
    return { ...o, source: "web" };
  }
  return {
    ...o,
    payment: { method: "cod", status: "paid" },
    source: o.source ?? "web",
  };
}

export function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<StoredOrder> {
  return enqueue(async () => {
    const store = await load();
    const order = store.orders.find((o) => o.id === id);
    if (!order) throw new Error(`Unknown order: ${id}`);
    if (!(status in ORDER_STATUS_LABELS))
      throw new Error(`Unknown status: ${status}`);
    if (order.status !== status) {
      order.status = status;
      order.statusHistory.push({ status, at: new Date().toISOString() });
    }
    await persist(store);
    return order;
  });
}

/** test helper — wipe and reseed */
export function resetStore(): Promise<Store> {
  return enqueue(async () => {
    const fresh = seed();
    await persist(fresh);
    return fresh;
  });
}

/** test helper — write an arbitrary (possibly legacy-shaped) state document */
export function __writeRawState(state: Record<string, unknown>): Promise<void> {
  return enqueue(async () => {
    const col = await stateCollection();
    await col.replaceOne(
      { _id: STATE_ID },
      { ...state, _id: STATE_ID },
      { upsert: true },
    );
  });
}
