import { CartProvider } from "@/context/cart-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { PageTransition } from "@/components/page-transition";
import { getSettings } from "@/server/store";
import { getTheme, themeStyle } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = await getSettings();
  const active = getTheme(theme);

  return (
    <div
      data-theme={active.id}
      style={themeStyle(active.id)}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <CartProvider>
        <Header />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <WhatsAppButton />
      </CartProvider>
    </div>
  );
}
