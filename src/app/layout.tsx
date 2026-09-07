import type { Metadata } from "next";
import {
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Inter,
  Playfair_Display,
  Spectral,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const FONT_VARS = [
  inter.variable,
  playfair.variable,
  fraunces.variable,
  dmSerif.variable,
  dmSans.variable,
  spectral.variable,
].join(" ");

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
    <html lang="en" className={`${FONT_VARS} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
