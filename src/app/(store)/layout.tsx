import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { ProductPhotosProvider } from "@/context/product-photos-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { PageTransition } from "@/components/page-transition";
import { OfferStrip } from "@/components/home/offer-strip";
import { getSettings } from "@/server/store";
import { getTheme, themeStyle } from "@/lib/themes";
import { resolveActiveFestivalId } from "@/lib/festivals";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = await getSettings();
  // Site-wide theme: the admin's saved choice, or an auto-activated
  // festival if they've left it on "everyday" and today falls in that
  // festival's date window (see lib/festivals.ts).
  const activeId = resolveActiveFestivalId(theme);
  const active = getTheme(activeId);

  return (
    <div
      data-theme={active.id}
      style={themeStyle(active.id)}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <CartProvider>
        <AuthProvider>
          <ProductPhotosProvider>
            <OfferStrip themeId={activeId} />
            <Header />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <WhatsAppButton />
          </ProductPhotosProvider>
        </AuthProvider>
      </CartProvider>
    </div>
  );
}
