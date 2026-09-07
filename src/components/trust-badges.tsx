import { HandHeart, ShieldCheck, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/format";

const items = [
  {
    icon: HandHeart,
    title: "100% home-cooked",
    copy: "Made in small batches in a family kitchen — never a factory line.",
  },
  {
    icon: ShieldCheck,
    title: "FSSAI-approved",
    copy: "Licensed kitchen, batch-dated jars, full ingredient lists.",
  },
  {
    icon: Truck,
    title: `Free delivery over ${formatPrice(FREE_DELIVERY_THRESHOLD)}`,
    copy: "Cold-packed and dispatched within 48 hours of cooking.",
  },
];

export function TrustBadges() {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, copy }) => (
        <li
          key={title}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
        </li>
      ))}
    </ul>
  );
}
