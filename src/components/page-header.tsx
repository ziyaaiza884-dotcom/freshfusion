import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** breadcrumb trail + the page's single <h1> + an intro paragraph */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  intro,
}: {
  crumbs: { name: string; href: string }[];
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        {crumbs.map((c, i) => (
          <span key={c.href} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:text-foreground">
                {c.name}
              </Link>
            ) : (
              <span className="text-foreground">{c.name}</span>
            )}
          </span>
        ))}
      </nav>
      {eyebrow && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
      {intro && (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
      )}
    </header>
  );
}
