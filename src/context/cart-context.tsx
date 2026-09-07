"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  cartReducer,
  computeTotals,
  emptyCart,
  type CartAction,
  type CartState,
  type CartTotals,
} from "@/lib/cart";

const STORAGE_KEY = "freshfusion.cart.v1";

interface CartContextValue {
  state: CartState;
  totals: CartTotals;
  dispatch: React.Dispatch<CartAction>;
  hydrated: boolean;
  /** transient signal so the header badge can bounce on add */
  lastAddedAt: number | null;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      savedForLater: Array.isArray(parsed.savedForLater)
        ? parsed.savedForLater
        : [],
      discountCode:
        typeof parsed.discountCode === "string" ? parsed.discountCode : null,
    };
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, baseDispatch] = useReducer(cartReducer, emptyCart);
  const [hydrated, setHydrated] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState<number | null>(null);
  const firstRun = useRef(true);

  // Hydrate once from localStorage on mount. Reading storage during render
  // would break SSR, so this is the sanctioned "sync from external system"
  // effect and the set-state opt-out below is deliberate.
  useEffect(() => {
    const stored = readStored();
    if (stored) baseDispatch({ type: "hydrate", state: stored });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration flag
    setHydrated(true);
  }, []);

  // persist on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [state, hydrated]);

  const dispatch = useMemo<React.Dispatch<CartAction>>(
    () => (action) => {
      if (action.type === "add") setLastAddedAt(Date.now());
      baseDispatch(action);
    },
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      totals: computeTotals(state),
      dispatch,
      hydrated,
      lastAddedAt,
    }),
    [state, dispatch, hydrated, lastAddedAt],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function useCartLine(slug: string) {
  const { state } = useCart();
  return state.items.find((i) => i.slug === slug) ?? null;
}
