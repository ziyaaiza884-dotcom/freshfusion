import type { Metadata } from "next";
// Self-hosted via Fontsource rather than next/font/google: that loader
// fetches font files from Google at build time, which started failing
// intermittently on Render's build servers. These ship the files inside
// node_modules, so the build never needs network access for fonts.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/800.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/500.css";
import "@fontsource/spectral/600.css";
import "@fontsource/spectral/700.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Small-batch home-cooked pickles and spices from a licensed family kitchen. Beef, fish and mango pickles, whole spices and ready-to-cook specialties, delivered fresh.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fresh Fusion — Home-cooked flavours, delivered fresh",
    template: "%s · Fresh Fusion",
  },
  description,
  applicationName: "Fresh Fusion",
  openGraph: {
    type: "website",
    siteName: "Fresh Fusion",
    title: "Fresh Fusion — Home-cooked flavours, delivered fresh",
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh Fusion",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
