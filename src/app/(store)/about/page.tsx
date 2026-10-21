import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { pageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seo.config";
import { categoryPath } from "@/lib/site";

export function generateMetadata(): Metadata {
  return pageMetadata(PAGE_SEO.about, "/about");
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
        eyebrow="Our kitchen"
        title="A family kitchen in Kerala"
        intro="Fresh Fusion started the way most good pickles do — in a home kitchen, with recipes passed down and cooked for family first."
      />

      <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-bold text-foreground">Who we are</h2>
          <p className="mt-3">
            TODO-JAMSH: two or three sentences about the family behind Fresh
            Fusion — who cooks, where the kitchen is, and how it started.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground">How we make it</h2>
          <p className="mt-3">
            Everything is cooked in small batches, the way it is at home. Beef
            and fish pickles are slow-cooked in a dark masala, mangoes and
            lemons are cut and cured by hand, and spices are packed in small
            lots so they reach you still fragrant. Every jar carries the date
            its batch was cooked, and orders are packed fresh within 48 hours.
          </p>
          <p className="mt-3">
            TODO-JAMSH: anything special about your process — oil used,
            where spices come from, no added preservatives, etc.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground">FSSAI approved</h2>
          <p className="mt-3">
            Our kitchen is approved by the Food Safety and Standards Authority
            of India (FSSAI). Licence number: TODO-JAMSH.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground">What we make</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href={categoryPath("pickles")} className="font-semibold text-primary hover:underline">
                Kerala pickles
              </Link>{" "}
              — beef, fish, baby mango, lemon, garlic, veg mix and more
            </li>
            <li>
              <Link href={categoryPath("spices")} className="font-semibold text-primary hover:underline">
                Spice packs
              </Link>{" "}
              — whole pepper, cardamom, cloves, cinnamon and everyday seeds
            </li>
            <li>
              <Link href={categoryPath("specialty")} className="font-semibold text-primary hover:underline">
                Chutneys, masalas & gravies
              </Link>{" "}
              — kitchen shortcuts made the slow way
            </li>
          </ul>
        </section>
      </div>

      <Link
        href="/shop"
        className="mt-12 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Shop the kitchen <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
