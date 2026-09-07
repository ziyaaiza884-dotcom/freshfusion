import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter delivery details and place your Fresh Fusion order.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
