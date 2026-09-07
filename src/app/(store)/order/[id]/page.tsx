import type { Metadata } from "next";
import { OrderView } from "@/components/order/order-view";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Fresh Fusion order details and delivery tracking.",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderView id={id} />;
}
