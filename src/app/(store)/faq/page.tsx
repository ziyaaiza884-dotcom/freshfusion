import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { FAQ } from "@/lib/faq";
import { pageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seo.config";
import { faqLd } from "@/lib/structured-data";

export function generateMetadata(): Metadata {
  return pageMetadata(PAGE_SEO.faq, "/faq");
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <JsonLd data={faqLd(FAQ)} />
      <PageHeader
        crumbs={[
          { name: "Home", href: "/" },
          { name: "FAQ", href: "/faq" },
        ]}
        eyebrow="Help"
        title="Frequently asked questions"
        intro="Shelf life, storage, delivery and what goes into every jar."
      />

      <div className="mt-10 space-y-12">
        {FAQ.map((group) => (
          <section key={group.title}>
            <h2 className="text-xl font-bold">{group.title}</h2>
            <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
              {group.items.map((item) => (
                <details key={item.q} className="group p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground marker:hidden">
                    <h3 className="inline">{item.q}</h3>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Still have a question?{" "}
        <Link href="/contact" className="font-semibold text-primary hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
