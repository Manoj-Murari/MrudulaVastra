import { createPublicClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import CategoryGrid from "@/components/shop/CategoryGrid";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trending Now — Most Loved Picks | Mrudula Vastra",
  description:
    "Discover what's trending at Mrudula Vastra — our most loved sarees, dress materials & ethnic wear hand-picked by our curators. Shop the hottest styles from Machilipatnam with free delivery across India.",
  alternates: {
    canonical: "https://mrudulavastra.in/trending",
  },
  openGraph: {
    title: "Trending Now | Mrudula Vastra",
    description:
      "Shop trending ethnic wear at Mrudula Vastra — curated picks in sarees, dress materials & kids wear.",
    url: "https://mrudulavastra.in/trending",
    type: "website",
  },
};

export default async function TrendingPage() {
  const supabase = await createPublicClient();

  // Fetch all trending products
  const { data: products } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("is_trending", true)
    .order("id", { ascending: false });

  // Unique categories from trending products for the filter bar
  const uniqueCategories: string[] = Array.from(
    new Set(((products as any[]) || []).map((p: any) => p.category).filter(Boolean))
  );

  const PREFERRED_ORDER = ["Sarees", "Dresses", "Dress Materials", "Kids Wear"];
  const sortedCategories = uniqueCategories.sort((a, b) => {
    const ia = PREFERRED_ORDER.indexOf(a);
    const ib = PREFERRED_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10 lg:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-6">
            <div className="min-w-0">
              <p className="hidden lg:block uppercase font-bold text-gold tracking-[0.5em] text-[9px] mb-2">
                Curated Picks
              </p>
              <h1 className="font-playfair text-forest font-medium tracking-wide text-[22px] sm:text-[28px] lg:text-[34px] leading-tight">
                Trending Right Now
              </h1>
            </div>
            <p className="hidden lg:block text-text-muted/60 font-dm text-[13px] italic whitespace-nowrap pb-1">
              Hand-picked styles our customers love most
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
            </div>
          }
        >
          <CategoryGrid
            products={products || []}
            categoryTitle="Trending"
            categorySlug="trending"
            initialCategories={sortedCategories}
            multiCategory={true}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
