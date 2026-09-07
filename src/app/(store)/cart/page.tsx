import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Fresh Fusion jars before checkout.",
};

export default function CartPage() {
  return <CartView />;
}
