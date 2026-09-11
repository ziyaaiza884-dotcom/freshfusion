import { Star } from "lucide-react";

const reviews = [
  {
    quote:
      "Tastes exactly like my grandmother's beef pickle from Thrissur. I order two bottles every month for our house in Dubai.",
    name: "Fathima R.",
    place: "Dubai, UAE",
  },
  {
    quote:
      "The fish pickle doesn't have that factory-sharp vinegar taste — it's slow-cooked, you can tell. Reached Riyadh in perfect shape.",
    name: "Anoop Varghese",
    place: "Riyadh, Saudi Arabia",
  },
  {
    quote:
      "Ordered the spice pack for Onam sadya. Freshly ground, no dust in the jar, and it actually smelled like the spice bazaar in Kochi.",
    name: "Divya Menon",
    place: "Kochi, Kerala",
  },
];

export function Testimonials() {
  return (
    <ul className="grid gap-5 sm:grid-cols-3">
      {reviews.map((r) => (
        <li
          key={r.name}
          className="flex flex-col rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex gap-0.5 text-primary" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
            &ldquo;{r.quote}&rdquo;
          </p>
          <p className="mt-4 text-sm font-semibold text-foreground">
            {r.name}
            <span className="ml-1.5 font-normal text-muted-foreground">
              · {r.place}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
