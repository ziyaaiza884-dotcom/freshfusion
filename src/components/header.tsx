"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=pickles", label: "Pickles" },
  { href: "/shop?category=spices", label: "Spices" },
  { href: "/shop?category=specialty", label: "Specialty" },
];

export function Header() {
  const pathname = usePathname();
  const { totals, lastAddedAt, hydrated } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md after:absolute after:inset-x-0 after:bottom-[-2px] after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-primary after:to-transparent after:opacity-70 relative">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-lg font-bold text-primary-strong"
        >
          <Image
            src="/images/logo.jpeg"
            alt="Fresh Fusion Spices & Pickles"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          Fresh&nbsp;Fusion
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
                pathname === item.href.split("?")[0] &&
                  item.href.includes("?") === false &&
                  "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/cart"
            aria-label={`Cart, ${totals.count} item${totals.count === 1 ? "" : "s"}`}
            className="relative grid h-11 w-11 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {hydrated && totals.count > 0 && (
                <motion.span
                  key={`count-${lastAddedAt ?? "initial"}`}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [1.35, 1], opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground"
                >
                  {totals.count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border/70 bg-background md:hidden"
          >
            <ul className="mx-auto max-w-6xl px-4 py-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-surface-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
