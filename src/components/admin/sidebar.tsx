"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ImageIcon,
  LogOut,
  Package,
  Palette,
  ShoppingCart,
  Sprout,
  Star,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/media", label: "Homepage media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Palette },
];

function useLogout() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return { logout, loggingOut };
}

/** Vertical rail on md+ screens. */
export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-5 font-serif text-base font-bold text-primary-strong">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sprout className="h-4 w-4" />
        </span>
        Fresh Fusion
      </div>
      <p className="px-5 pb-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Admin
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="mb-1 block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-surface-muted"
        >
          ← Back to storefront
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-accent disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}

/** Compact top bar shown below md, with a horizontally scrollable nav. */
export function AdminTopbar() {
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 font-serif text-sm font-bold text-primary-strong">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sprout className="h-3.5 w-3.5" />
          </span>
          Fresh Fusion · Admin
        </span>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          aria-label="Sign out"
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-accent disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
