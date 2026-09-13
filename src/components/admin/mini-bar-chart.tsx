import { formatPrice } from "@/lib/format";
import type { DayRevenue } from "@/lib/analytics";

/** Tiny inline-SVG bar chart — no chart library. */
export function MiniBarChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const w = 100 / data.length;
  const lastIndex = data.length - 1;

  return (
    <figure>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-32 w-full overflow-visible"
        role="img"
        aria-label={`Revenue for the last ${data.length} days`}
      >
        <defs>
          <linearGradient id="ff-bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--primary-strong)" }} />
            <stop offset="100%" style={{ stopColor: "var(--primary)" }} />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="39.5"
          x2="100"
          y2="39.5"
          style={{ stroke: "var(--border)" }}
          strokeWidth={0.5}
        />
        {data.map((d, i) => {
          const h = (d.revenue / max) * 34;
          const isToday = i === lastIndex;
          return (
            <rect
              key={d.date}
              x={i * w + w * 0.18}
              y={38 - h}
              width={w * 0.64}
              height={Math.max(h, d.revenue > 0 ? 1 : 0)}
              rx={1.2}
              fill="url(#ff-bar-gradient)"
              opacity={isToday ? 1 : 0.75}
            >
              <title>{`${d.label} · ${formatPrice(d.revenue)} · ${d.orders} orders`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        {data.map((d, i) => (
          <span
            key={d.date}
            className={
              i === lastIndex
                ? "flex-1 text-center font-semibold text-foreground"
                : "flex-1 text-center"
            }
          >
            {d.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
