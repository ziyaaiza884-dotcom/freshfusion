"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { PaymentMethod } from "@/lib/orders";

const FIELD: Record<
  Exclude<PaymentMethod, "cod">,
  { label: string; placeholder: string; hint: string }
> = {
  card: {
    label: "Card number",
    placeholder: "4111 1111 1111 1111",
    hint: "Test mode — any value works, nothing is charged.",
  },
  upi: {
    label: "UPI ID",
    placeholder: "you@bank",
    hint: "Test mode — no collect request is actually sent.",
  },
  wallet: {
    label: "Wallet",
    placeholder: "Mock Wallet",
    hint: "Test mode — balance is simulated.",
  },
};

export function MockRazorpayModal({
  open,
  amount,
  method,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  amount: number;
  method: Exclude<PaymentMethod, "cod">;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (outcome: "success" | "failure") => void;
}) {
  const cfg = FIELD[method];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={busy ? undefined : onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Payment"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="relative w-full max-w-sm overflow-hidden rounded-t-2xl bg-surface sm:rounded-2xl"
          >
            <div className="bg-[#0b1f3a] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Fresh Fusion</span>
                <span className="text-xs text-white/70">Test mode</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{formatPrice(amount)}</p>
            </div>

            <div className="p-5">
              <label className="text-sm font-medium" htmlFor="pay-field">
                {cfg.label}
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="pay-field"
                  key={`${method}-${open}`}
                  defaultValue=""
                  placeholder={cfg.placeholder}
                  disabled={busy}
                  className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{cfg.hint}</p>

              {error && (
                <p role="alert" className="mt-3 text-xs font-medium text-accent">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => onSubmit("success")}
                disabled={busy}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Pay {formatPrice(amount)}</>
                )}
              </button>

              <div className="mt-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSubmit("failure")}
                  disabled={busy}
                  className="text-muted-foreground underline-offset-2 hover:text-accent hover:underline disabled:opacity-50"
                >
                  Simulate a failed payment
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Mock gateway · same signature scheme as Razorpay
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
