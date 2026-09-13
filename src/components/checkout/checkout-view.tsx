"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/format";
import {
  deliverySlots,
  etaWindow,
  isPrepaid,
  lookupPincode,
  saveOrder,
  type PaymentMethod,
  type StoredOrder,
} from "@/lib/orders";
import { ProductPhoto } from "@/components/product-photo";
import { getProduct } from "@/data/catalog";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartSummary } from "@/components/cart/cart-summary";
import { ProductGridSkeleton } from "@/components/product-grid";
import { MockRazorpayModal } from "@/components/checkout/mock-razorpay-modal";

type PaymentIntent =
  | { method: "cod" }
  | {
      method: PaymentMethod;
      gatewayOrderId: string;
      paymentId: string;
      signature: string;
    };

const PAYMENTS = [
  {
    id: "upi",
    label: "UPI",
    icon: Smartphone,
    hint: "GPay · PhonePe · Paytm",
    disabled: false,
  },
  {
    id: "card",
    label: "Card",
    icon: CreditCard,
    hint: "Visa · Mastercard · RuPay",
    disabled: true,
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    hint: "Paytm · Amazon Pay",
    disabled: true,
  },
  {
    id: "cod",
    label: "Cash on delivery",
    icon: Banknote,
    hint: "Pay the rider",
    disabled: false,
  },
] as const;

export function CheckoutView() {
  const router = useRouter();
  const { state, totals, dispatch, hydrated } = useCart();
  const { customer } = useAuth();
  // no slot picker in the UI — just take the earliest available slot
  const defaultSlot = useMemo(() => deliverySlots()[0] ?? "", []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    pincode: "",
    city: "",
    state: "",
    payment: "upi",
  });

  // prefill contact details for a signed-in customer, without clobbering
  // anything they've already typed
  useEffect(() => {
    if (!customer) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form fields from the signed-in session, not internal component state
    setForm((f) => ({
      ...f,
      name: f.name || customer.name,
      email: f.email || customer.email,
      phone: f.phone || customer.phone || "",
    }));
  }, [customer]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // gateway modal state (card / upi / wallet)
  const [payModal, setPayModal] = useState<{
    method: Exclude<PaymentMethod, "cod">;
    gatewayOrderId: string;
  } | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // auto-fill city/state as soon as a known 6-digit pincode is typed
  const setPincode = (raw: string) => {
    const pincode = raw.replace(/\D/g, "").slice(0, 6);
    setForm((f) => {
      const hit = pincode.length === 6 ? lookupPincode(pincode) : null;
      return hit
        ? { ...f, pincode, city: hit.city, state: hit.state }
        : { ...f, pincode };
    });
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <ProductGridSkeleton count={3} />
      </div>
    );
  }

  if (state.items.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your cart is empty — add a jar or two first.
        </p>
        <ButtonLink href="/shop" className="mt-6">
          Browse the kitchen
        </ButtonLink>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a 10-digit number";
    if (!form.line1.trim()) e.line1 = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a 6-digit pincode";
    if (!form.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildDraft = () => {
    const eta = etaWindow();
    return {
      placedAt: new Date().toISOString(),
      items: state.items,
      totals,
      customer: { name: form.name, email: form.email, phone: form.phone },
      address: {
        line1: form.line1,
        line2: form.line2,
        pincode: form.pincode,
        city: form.city,
        state: form.state,
      },
      deliverySlot: defaultSlot,
      giftNote: "",
      customerId: customer?.id,
      discountCode: state.discountCode,
      etaFrom: eta.from,
      etaTo: eta.to,
    };
  };

  const submitOrder = async (payment: PaymentIntent): Promise<boolean> => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...buildDraft(), payment }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      order?: StoredOrder;
      error?: string;
    };
    if (!res.ok || !data.order) {
      throw new Error(data.error ?? `Order failed (${res.status})`);
    }
    saveOrder(data.order); // local mirror so /order/[id] works instantly
    dispatch({ type: "clear" });
    router.push(`/order/${data.order.id}`);
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) {
      document
        .querySelector("[data-error='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitError(null);
    setPlacing(true);

    const method = form.payment as PaymentMethod;
    try {
      if (!isPrepaid(method)) {
        await submitOrder({ method: "cod" });
        return;
      }
      // prepaid: open a gateway order, then the payment modal
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: totals.total,
          receipt: `${form.email || "guest"}-${Date.now()}`,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        gatewayOrder?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.gatewayOrder) {
        throw new Error(data.error ?? "Could not start the payment");
      }
      setPayError(null);
      setPayModal({
        method: method as Exclude<PaymentMethod, "cod">,
        gatewayOrderId: data.gatewayOrder.id,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `${err.message}. Please try again.`
          : "Something went wrong placing the order.",
      );
      setPlacing(false);
    }
  };

  const handlePayment = async (outcome: "success" | "failure") => {
    if (!payModal) return;
    setPayBusy(true);
    setPayError(null);
    try {
      const res = await fetch("/api/payments/mock-pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gatewayOrderId: payModal.gatewayOrderId,
          outcome,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        paymentId?: string;
        signature?: string;
        error?: string;
      };
      if (!res.ok || !data.paymentId || !data.signature) {
        throw new Error(data.error ?? "Payment failed");
      }
      await submitOrder({
        method: payModal.method,
        gatewayOrderId: payModal.gatewayOrderId,
        paymentId: data.paymentId,
        signature: data.signature,
      });
      setPayModal(null);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
      setPayBusy(false);
    }
  };

  const cancelPayment = () => {
    setPayModal(null);
    setPayBusy(false);
    setPlacing(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Checkout</h1>
      <Link
        href="/cart"
        className="mt-1 inline-block text-sm text-primary hover:underline"
      >
        ← Back to cart
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <Fieldset title="Contact">
            <Field label="Full name" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoComplete="name"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <Input
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                />
              </Field>
            </div>
          </Fieldset>

          <Fieldset title="Delivery address">
            <Field label="Flat / house / street" error={errors.line1}>
              <Input
                value={form.line1}
                onChange={(e) => set("line1", e.target.value)}
                autoComplete="address-line1"
              />
            </Field>
            <Field label="Area / landmark (optional)">
              <Input
                value={form.line2}
                onChange={(e) => set("line2", e.target.value)}
                autoComplete="address-line2"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Pincode" error={errors.pincode}>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  autoComplete="postal-code"
                />
              </Field>
              <Field label="City" error={errors.city}>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>
              <Field label="State">
                <Input
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              Try pincode <code className="text-foreground">682001</code>,{" "}
              <code className="text-foreground">560001</code> or{" "}
              <code className="text-foreground">110001</code> to see auto-fill.
            </p>
          </Fieldset>

          <Fieldset title="Payment">
            <div className="grid gap-2 sm:grid-cols-2">
              {PAYMENTS.map(({ id, label, icon: Icon, hint, disabled }) => (
                <label
                  key={id}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    disabled
                      ? "cursor-not-allowed border-border opacity-50"
                      : form.payment === id
                        ? "cursor-pointer border-primary bg-primary/5"
                        : "cursor-pointer border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 accent-[var(--primary)]"
                    checked={form.payment === id}
                    disabled={disabled}
                    onChange={() => set("payment", id)}
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Icon className="h-4 w-4" /> {label}
                      {disabled && (
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Coming soon
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              This is a demo — no gateway is called and no money moves. A live
              build would hand off to Razorpay / Stripe here.
            </p>
          </Fieldset>
        </div>

        <div className="space-y-4">
          <ul className="rounded-xl border border-border bg-surface p-4">
            {state.items.map((line) => {
              const product = getProduct(line.slug);
              return (
                <li
                  key={line.slug}
                  className="flex items-center gap-3 py-2 text-sm"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
                    <ProductPhoto
                      slug={line.slug}
                      art={line.art}
                      category={product?.category ?? "pickles"}
                      className="h-full w-full"
                    />
                  </div>
                  <span className="flex-1">
                    {line.name}
                    <span className="text-muted-foreground"> × {line.qty}</span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(line.price * line.qty)}
                  </span>
                </li>
              );
            })}
          </ul>

          <CartSummary showCheckout={false} />

          <Button
            size="lg"
            className="w-full"
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                {payModal ? "Awaiting payment…" : "Placing order…"}
              </>
            ) : form.payment === "cod" ? (
              <>Place order · {formatPrice(totals.total)}</>
            ) : (
              <>Pay {formatPrice(totals.total)}</>
            )}
          </Button>
          {submitError && (
            <p
              role="alert"
              className="rounded-md bg-[#f6e4e4] px-3 py-2 text-center text-xs font-medium text-accent"
            >
              {submitError}
            </p>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground"
          >
            {form.payment === "cod"
              ? "Pay the rider on delivery."
              : "You’ll confirm payment in the next step. Demo gateway — no real charge."}
          </motion.p>
        </div>
      </div>

      <MockRazorpayModal
        open={payModal !== null}
        method={payModal?.method ?? "card"}
        amount={totals.total}
        busy={payBusy}
        error={payError}
        onCancel={cancelPayment}
        onSubmit={handlePayment}
      />
    </div>
  );
}

function Fieldset({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-lg font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" data-error={Boolean(error)}>
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-accent">{error}</span>}
    </label>
  );
}
