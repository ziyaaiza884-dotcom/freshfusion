import { formatPrice } from "@/lib/format";
import type { DayRevenue } from "@/lib/analytics";

/** Tiny inline-SVG bar chart — no chart library. */
export function MiniBarChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const w = 100 / data.length;

  return (
    <figure>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-32 w-full"
        role="img"
        aria-label={`Revenue for the last ${data.length} days`}
      >
        {data.map((d, i) => {
          const h = (d.revenue / max) * 36;
          return (
            <rect
              key={d.date}
              x={i * w + w * 0.18}
              y={40 - h}
              width={w * 0.64}
              height={Math.max(h, d.revenue > 0 ? 1 : 0)}
              rx={0.8}
              className="fill-primary"
            >
              <title>{`${d.label} · ${formatPrice(d.revenue)} · ${d.orders} orders`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.date} className="flex-1 text-center">
            {d.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
