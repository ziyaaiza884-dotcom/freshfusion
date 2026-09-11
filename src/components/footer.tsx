import Link from "next/link";
import { MessageCircle, Phone, Sprout } from "lucide-react";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
} from "@/lib/contact";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-surface-muted/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-serif text-lg font-bold text-primary-strong">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Sprout className="h-4 w-4" />
            </span>
            Fresh Fusion
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Home-cooked flavours, delivered fresh. Small batches of pickles and
            spices, made the way they are at home.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href={CONTACT_PHONE_TEL}
              className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 text-primary" />
              {CONTACT_PHONE_DISPLAY}
            </a>
            <a
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <FooterCol
          title="Shop"
          links={[
            ["All products", "/shop"],
            ["Pickles", "/shop?category=pickles"],
            ["Spices", "/shop?category=spices"],
            ["Specialty", "/shop?category=specialty"],
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            ["Track an order", "/cart"],
            ["Delivery & returns", "/shop"],
            ["FSSAI & sourcing", "/shop"],
            ["Contact", CONTACT_WHATSAPP_URL],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["Our kitchen", "/"],
            ["Subscribe & save", "/"],
            ["Refer a friend", "/"],
          ]}
        />
      </div>
      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Fresh Fusion · 100% home-cooked ·
        FSSAI-approved kitchen · Demo storefront
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => {
          const external = href.startsWith("http");
          return (
            <li key={label}>
              <Link
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
