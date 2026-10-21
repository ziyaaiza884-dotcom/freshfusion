import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
} from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seo.config";

export function generateMetadata(): Metadata {
  return pageMetadata(PAGE_SEO.contact, "/contact");
}

const ROWS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us — fastest reply",
    href: CONTACT_WHATSAPP_URL,
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: CONTACT_PHONE_DISPLAY,
    href: CONTACT_PHONE_TEL,
  },
  {
    icon: Mail,
    label: "Email",
    value: "TODO-JAMSH (shop email address)",
  },
  {
    icon: MapPin,
    label: "Delivery area",
    value: "TODO-JAMSH (cities / states you deliver to)",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
        eyebrow="Get in touch"
        title="Contact Fresh Fusion"
        intro="Order on WhatsApp, ask about an ingredient, or plan a bulk or gift order — we usually reply within the day."
      />

      <h2 className="sr-only">Ways to reach us</h2>
      <ul className="mt-10 divide-y divide-border rounded-lg border border-border bg-surface">
        {ROWS.map(({ icon: Icon, label, value, href, external }) => (
          <li key={label} className="flex items-start gap-4 p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              {href ? (
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-sm text-primary hover:underline"
                >
                  {value}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">{value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
