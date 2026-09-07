"use client";

import { motion } from "framer-motion";
import { CalendarClock, PauseCircle, Percent } from "lucide-react";
import { easeOutExpo } from "@/components/ui/motion";

const points = [
  { icon: Percent, text: "Save 10% on every recurring box" },
  { icon: CalendarClock, text: "Weekly, fortnightly or monthly" },
  { icon: PauseCircle, text: "Pause, skip or cancel anytime" },
];

export function SubscribeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: easeOutExpo }}
      className="relative overflow-hidden rounded-2xl bg-primary-strong px-6 py-10 text-primary-foreground sm:px-10"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5"
      />
      <div className="relative">
        <h2 className="max-w-lg text-2xl font-bold sm:text-3xl">
          Subscribe &amp; save — your kitchen staples, on repeat
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm">
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              {text}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-primary-foreground/70">
          Subscriptions arrive in a later release — the storefront demo keeps
          this as a preview.
        </p>
      </div>
    </motion.div>
  );
}
