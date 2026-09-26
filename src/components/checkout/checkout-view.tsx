"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/format";
import { lookupPincode } from "@/lib/orders";
import { shopOrderWhatsAppUrl } from "@/lib/contact";
import { ProductPhoto } from "@/components/product-photo";
import { getProduct } from "@/data/catalog";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartSummary } from "@/components/cart/cart-summary";
import { ProductGridSkeleton } from "@/components/product-grid";

export function CheckoutView() {
  const { state, totals, dispatch, hydrated } = useCart();
  const { customer } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    pincode: "",
    city: "",
    state: "",
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
  const [sent, setSent] = useState(false);

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

  if (state.items.length === 0 && !sent) {
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

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#25D366]/15 text-[#128C4A]">
          <MessageCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-bold">Continue on WhatsApp</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&rsquo;ve opened WhatsApp with your order ready to send — just tap
          send, and we&rsquo;ll confirm it with you there.
        </p>
        <ButtonLink href="/shop" className="mt-6">
          Keep browsing
        </ButtonLink>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a 10-digit number";
    if (!form.line1.trim()) e.line1 = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a 6-digit pincode";
    if (!form.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildWhatsAppMessage = () => {
    const lines = state.items
      .map((line, i) => `${i + 1}. ${line.name} x${line.qty} — ${formatPrice(line.price * line.qty)}`)
      .join("\n");
    const totalLines = [
      `Subtotal: ${formatPrice(totals.subtotal)}`,
      totals.discount > 0
        ? `Discount${totals.discountLabel ? ` (${totals.discountLabel})` : ""}: − ${formatPrice(totals.discount)}`
        : null,
      `Packaging: ${formatPrice(totals.packaging)}`,
      `Delivery: ${totals.delivery === 0 ? "Free" : formatPrice(totals.delivery)}`,
      `Total: ${formatPrice(totals.total)}`,
    ].filter(Boolean).join("\n");

    return [
      "Hi Fresh Fusion! I'd like to order:",
      "",
      lines,
      "",
      totalLines,
      "",
      "Deliver to:",
      form.name,
      [form.line1, form.line2].filter(Boolean).join(", "),
      `${form.city} ${form.pincode}, ${form.state}`,
      `Phone: ${form.phone}`,
    ].join("\n");
  };

  const orderViaWhatsApp = () => {
    if (!validate()) {
      document
        .querySelector("[data-error='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    window.open(shopOrderWhatsAppUrl(buildWhatsAppMessage()), "_blank", "noopener,noreferrer");
    dispatch({ type: "clear" });
    setSent(true);
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
              <Field label="Email (optional)" error={errors.email}>
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
            <p className="flex items-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 p-3.5 text-sm text-[#128C4A]">
              <MessageCircle className="h-4 w-4 shrink-0" />
              You&rsquo;ll confirm payment (UPI or cash on delivery) with us
              over WhatsApp once we&rsquo;ve reviewed your order.
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

          <Button size="lg" className="w-full" onClick={orderViaWhatsApp}>
            <MessageCircle className="h-4 w-4" /> Order via WhatsApp ·{" "}
            {formatPrice(totals.total)}
          </Button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground"
          >
            Opens WhatsApp with your order ready to send.
          </motion.p>
        </div>
      </div>
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
