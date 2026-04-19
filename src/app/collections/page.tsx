import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ShopGrid from "@/components/shop/ShopGrid";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Collections — Sarees, Dress Materials & Kids Wear",
  description:
    "Browse our curated catalog of premium sarees, designer dress materials, and ethnic kids wear at Mrudula Vastra. Handloom, Kanjivaram, Banarasi & Pochampally silks from Machilipatnam. Free delivery across India.",
  alternates: {
    canonical: "https://mrudulavastra.in/collections",
  },
  openGraph: {
    title: "Shop All Collections | Mrudula Vastra",
    description:
      "Explore handpicked sarees, dress materials & kids wear — premium ethnic wear from India's finest weavers.",
    url: "https://mrudulavastra.in/collections",
    type: "website",
  },
};

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data: products } = await (supabase as any)
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" /></div>}>
          <ShopGrid products={products || []} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
