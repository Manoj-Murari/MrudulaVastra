import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import JsonLd from "@/components/seo/JsonLd";

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

/* ── Viewport Configuration ──────────────────────────── */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0E2219" },
  ],
};

/* ── Root Metadata — SEO Foundation ──────────────────── */
export const metadata: Metadata = {
  /* Title Template: Every child page inherits this pattern */
  title: {
    default: "Mrudula Vastra — Premium Sarees & Ethnic Wear from Machilipatnam",
    template: "%s | Mrudula Vastra — Premium Indian Ethnic Wear",
  },

  description:
    "Shop handpicked sarees, elegant dress materials & adorable kids wear at Mrudula Vastra. Premium Indian ethnic wear from Machilipatnam, Andhra Pradesh. Kanjivaram, Banarasi, Pochampally silks. Free shipping across India on orders above ₹2000.",

  keywords: [
    "Mrudula Vastra",
    "MrudulaVastra",
    "mrudulavastra",
    "premium sarees Machilipatnam",
    "luxury Indian ethnic wear",
    "handloom sarees online India",
    "Kanjivaram silk sarees",
    "Banarasi sarees online",
    "Pochampally silk sarees",
    "Chanderi sarees",
    "designer dress materials India",
    "kids ethnic wear online",
    "Indian sarees online shopping",
    "traditional Indian wear",
    "handpicked sarees Andhra Pradesh",
    "silk sarees Machilipatnam",
    "premium ethnic wear boutique",
    "Indian wedding sarees",
    "festive ethnic wear India",
    "ethnic wear for women and children",
  ],

  /* Authorship & Publishing signals */
  authors: [{ name: "Mrudula Vastra", url: "https://mrudulavastra.in" }],
  creator: "Mrudula Vastra",
  publisher: "Mrudula Vastra",

  /* Canonical & Alternate */
  metadataBase: new URL("https://mrudulavastra.in"),
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },

  /* Search engine directives */
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* Open Graph — Social Sharing (Facebook, LinkedIn, WhatsApp) */
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mrudulavastra.in",
    siteName: "Mrudula Vastra",
    title: "Mrudula Vastra — Premium Sarees & Ethnic Wear from Machilipatnam",
    description:
      "Discover handpicked sarees, elegant dress materials & adorable kids wear — sourced from India's finest weavers. Premium ethnic wear delivered to your doorstep.",
    images: [
      {
        url: "/images/hero-saree.webp",
        width: 1200,
        height: 630,
        alt: "Mrudula Vastra — Elegant woman wearing a premium handloom silk saree from Machilipatnam",
        type: "image/webp",
      },
    ],
  },

  /* Twitter Card */
  twitter: {
    card: "summary_large_image",
    title: "Mrudula Vastra — Premium Sarees & Ethnic Wear from Machilipatnam",
    description:
      "Handpicked sarees, dress materials & kids wear from India's finest weavers. Shop premium ethnic wear at Mrudula Vastra.",
    images: ["/images/hero-saree.webp"],
    creator: "@mrudulavastra",
  },

  /* App-level metadata */
  applicationName: "Mrudula Vastra",
  category: "E-Commerce",

  /* Verification placeholders — add your codes when available */
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },

  other: {
    "geo.region": "IN-AP",
    "geo.placename": "Machilipatnam",
    "geo.position": "16.1875;81.1389",
    "ICBM": "16.1875, 81.1389",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen font-dm bg-cream text-text-primary antialiased overflow-x-hidden">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
