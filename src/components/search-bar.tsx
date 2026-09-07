"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_LABELS, type Product } from "@/data/types";
import { autocomplete } from "@/lib/filters";
import { cn } from "@/lib/utils";

export function SearchBar({
  products,
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  placeholder = "Search “mango”, “pepper”, “beef”…",
  navigateOnPick = false,
  className,
}: {
  products: Product[];
  value: string;
  onChange: (next: string) => void;
  onSubmit?: (value: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  navigateOnPick?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = autocomplete(products, value);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (slug: string, name: string) => {
    setOpen(false);
    if (navigateOnPick) {
      router.push(`/product/${slug}`);
    } else {
      onChange(name);
      onSubmit?.(name);
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown")
              setActive((a) => Math.min(a + 1, suggestions.length - 1));
            else if (e.key === "ArrowUp")
              setActive((a) => Math.max(a - 1, 0));
            else if (e.key === "Enter") {
              if (active >= 0 && suggestions[active]) {
                e.preventDefault();
                pick(suggestions[active].slug, suggestions[active].name);
              } else {
                setOpen(false);
                onSubmit?.(value);
              }
            } else if (e.key === "Escape") setOpen(false);
          }}
          className="h-12 w-full rounded-full border border-border bg-surface pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange("");
              onSubmit?.("");
            }}
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
          >
            {suggestions.map((s, i) => (
              <li key={s.slug} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(s.slug, s.name)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm",
                    i === active ? "bg-surface-muted" : "bg-transparent",
                  )}
                >
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[s.category]}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
