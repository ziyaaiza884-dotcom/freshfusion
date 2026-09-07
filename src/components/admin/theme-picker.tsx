"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Moon } from "lucide-react";
import { FONT_PAIRS, THEMES, themeStyle } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function ThemePicker({ current }: { current: string }) {
  const router = useRouter();
  const [active, setActive] = useState(current);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (id: string) => {
    if (id === active || pending) return;
    setPending(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ theme: id }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Could not save");
      }
      setActive(id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setPending(null);
    }
  };

  return (
    <div>
      {error && <p className="mb-3 text-sm text-accent">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((theme) => {
          const isActive = theme.id === active;
          const isPending = pending === theme.id;
          return (
            <div
              key={theme.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-lg border transition-colors",
                isActive
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border",
              )}
            >
              {/* live preview rendered in the theme's own tokens */}
              <div
                style={themeStyle(theme.id)}
                className="bg-background p-4"
                aria-hidden
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Fresh Fusion
                  </span>
                  <span className="flex gap-1">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: "var(--spice)" }}
                    />
                  </span>
                </div>
                <p
                  className="mt-3 text-lg font-bold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Home-cooked flavours
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  delivered fresh, in small batches
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="inline-flex h-7 items-center px-3 text-xs font-semibold"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderRadius: "var(--radius-sm, 0.4rem)",
                    }}
                  >
                    Shop
                  </span>
                  <span
                    className="inline-flex h-7 items-center rounded-full border px-2 text-xs"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Pickles
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col border-t border-border bg-surface p-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm font-bold">
                    {theme.name}
                  </span>
                  {theme.dark && (
                    <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {isActive && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      <Check className="h-3 w-3" /> Live
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {theme.region}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {theme.blurb}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  {FONT_PAIRS[theme.fontPair].label}
                </p>

                {!isActive && (
                  <button
                    type="button"
                    onClick={() => choose(theme.id)}
                    disabled={pending !== null}
                    className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Set live"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
