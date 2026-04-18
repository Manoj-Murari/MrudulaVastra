import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ShopGrid from "@/components/shop/ShopGrid";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Collections — Mrudula Vastra",
  description:
    "Browse our entire curated catalog of sarees, dress materials, and kids wear — handpicked for elegance and tradition.",
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
