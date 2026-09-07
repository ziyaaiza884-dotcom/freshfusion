import type { Product } from "@/data/types";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  GST_RATE,
  PACKAGING_FEE,
} from "./format";

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  /** kept for rendering the thumbnail without re-looking-up the catalog */
  art: string;
  weightLabel: string;
}

export interface CartState {
  items: CartLine[];
  savedForLater: CartLine[];
  discountCode: string | null;
}

export const emptyCart: CartState = {
  items: [],
  savedForLater: [],
  discountCode: null,
};

export const MAX_QTY_PER_LINE = 10;

/** hardcoded demo coupons */
export const COUPONS: Record<string, { label: string; apply: (sub: number) => number }> = {
  FRESH10: { label: "10% off", apply: (sub) => Math.round(sub * 0.1) },
  PICKLE50: { label: "₹50 off orders above ₹500", apply: (sub) => (sub >= 500 ? 50 : 0) },
};

export type CartAction =
  | { type: "add"; product: Product; qty?: number; note?: string }
  | { type: "setQty"; slug: string; qty: number }
  | { type: "setNote"; slug: string; note: string }
  | { type: "remove"; slug: string }
  | { type: "saveForLater"; slug: string }
  | { type: "moveToCart"; slug: string }
  | { type: "removeSaved"; slug: string }
  | { type: "applyDiscount"; code: string | null }
  | { type: "clear" }
  | { type: "hydrate"; state: CartState };

const lineFromProduct = (
  product: Product,
  qty: number,
  note?: string,
): CartLine => ({
  slug: product.slug,
  name: product.name,
  price: product.price,
  qty,
  note,
  art: product.art,
  weightLabel: `${product.weight} ${product.unit}`,
});

const clampQty = (qty: number) =>
  Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.round(qty)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "add": {
      const qty = clampQty(action.qty ?? 1);
      const existing = state.items.find((i) => i.slug === action.product.slug);
      const items = existing
        ? state.items.map((i) =>
            i.slug === action.product.slug
              ? {
                  ...i,
                  qty: clampQty(i.qty + qty),
                  note: action.note ?? i.note,
                }
              : i,
          )
        : [...state.items, lineFromProduct(action.product, qty, action.note)];
      return { ...state, items };
    }

    case "setQty": {
      if (action.qty <= 0)
        return {
          ...state,
          items: state.items.filter((i) => i.slug !== action.slug),
        };
      return {
        ...state,
        items: state.items.map((i) =>
          i.slug === action.slug ? { ...i, qty: clampQty(action.qty) } : i,
        ),
      };
    }

    case "setNote":
      return {
        ...state,
        items: state.items.map((i) =>
          i.slug === action.slug ? { ...i, note: action.note } : i,
        ),
      };

    case "remove":
      return {
        ...state,
        items: state.items.filter((i) => i.slug !== action.slug),
      };

    case "saveForLater": {
      const line = state.items.find((i) => i.slug === action.slug);
      if (!line) return state;
      return {
        ...state,
        items: state.items.filter((i) => i.slug !== action.slug),
        savedForLater: [
          ...state.savedForLater.filter((i) => i.slug !== action.slug),
          line,
        ],
      };
    }

    case "moveToCart": {
      const line = state.savedForLater.find((i) => i.slug === action.slug);
      if (!line) return state;
      const existing = state.items.find((i) => i.slug === action.slug);
      return {
        ...state,
        savedForLater: state.savedForLater.filter((i) => i.slug !== action.slug),
        items: existing
          ? state.items.map((i) =>
              i.slug === action.slug
                ? { ...i, qty: clampQty(i.qty + line.qty) }
                : i,
            )
          : [...state.items, line],
      };
    }

    case "removeSaved":
      return {
        ...state,
        savedForLater: state.savedForLater.filter((i) => i.slug !== action.slug),
      };

    case "applyDiscount":
      return { ...state, discountCode: action.code };

    case "clear":
      return { ...emptyCart };

    default:
      return state;
  }
}

export interface CartTotals {
  count: number;
  subtotal: number;
  discount: number;
  discountLabel: string | null;
  packaging: number;
  delivery: number;
  tax: number;
  total: number;
  freeDeliveryRemaining: number;
}

export function computeTotals(state: CartState): CartTotals {
  const count = state.items.reduce((n, i) => n + i.qty, 0);
  const subtotal = state.items.reduce((n, i) => n + i.qty * i.price, 0);

  const coupon = state.discountCode ? COUPONS[state.discountCode] : undefined;
  const discount = coupon ? coupon.apply(subtotal) : 0;
  const discountedSub = Math.max(0, subtotal - discount);

  const hasItems = count > 0;
  const packaging = hasItems ? PACKAGING_FEE : 0;
  const delivery =
    !hasItems || discountedSub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const tax = Math.round(discountedSub * GST_RATE);
  const total = discountedSub + packaging + delivery + tax;

  return {
    count,
    subtotal,
    discount,
    discountLabel: coupon?.label ?? null,
    packaging,
    delivery,
    tax,
    total,
    freeDeliveryRemaining: Math.max(0, FREE_DELIVERY_THRESHOLD - discountedSub),
  };
}
