import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  amber: "bg-[#fff2e0] text-[#8a5320]",
  gold: "bg-[#fdf3d8] text-[#8a6a1e]",
  rose: "bg-[#f6e4e4] text-accent",
} as const;

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_var(--glow)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full transition-transform duration-200 group-hover:scale-110",
              TONES[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-serif text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
