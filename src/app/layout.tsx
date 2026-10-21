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

import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { HOME_SEO } from "@/lib/seo.config";

// Site-wide defaults. Public pages override all of this with their own
// pageMetadata() from src/lib/seo.config.ts; the template only applies to
// utility pages (cart, checkout, order) that set a plain title.
export function generateMetadata(): Metadata {
  return {
    ...pageMetadata(HOME_SEO, "/"),
    metadataBase: new URL(siteUrl()),
    title: { default: HOME_SEO.title, template: "%s · Fresh Fusion" },
    applicationName: "Fresh Fusion",
    alternates: undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
