import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mrudula Vastra — Elegance Woven in Every Thread",
  description:
    "Discover handpicked sarees, elegant dress materials, and adorable kids wear — crafted with love, woven with tradition. Premium Indian ethnic wear from Vijayawada.",
  keywords: [
    "sarees",
    "ethnic wear",
    "Indian fashion",
    "dress materials",
    "kids wear",
    "Kanjivaram silk",
    "handloom",
    "Vijayawada",
  ],
  openGraph: {
    title: "Mrudula Vastra — Premium Indian Ethnic Wear",
    description:
      "Handpicked sarees, elegant dress materials, and adorable kids wear — crafted with love, woven with tradition.",
    type: "website",
    locale: "en_IN",
    siteName: "Mrudula Vastra",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen font-dm bg-cream text-text-primary antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
