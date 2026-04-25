import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryGrid from "@/components/shop/CategoryGrid";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const revalidate = 0;

/* ── Slug → DB category mapping ──────────────────────── */
const CATEGORY_MAP: Record<string, { dbName: string; title: string; subtitle: string; seoDescription: string }> = {
  sarees: {
    dbName: "Sarees",
    title: "Sarees",
    subtitle: "Timeless drapes woven with heritage and grace",
    seoDescription:
      "Shop premium sarees at Mrudula Vastra — handpicked Kanjivaram, Banarasi, Pochampally & Chanderi silk sarees from Machilipatnam. Authentic handloom sarees with nationwide delivery.",
  },
  kurtas: {
    dbName: "Kurtas",
    title: "Kurtas",
    subtitle: "Contemporary silhouettes rooted in tradition",
    seoDescription:
      "Shop designer kurtas at Mrudula Vastra — premium ethnic kurtas for women with elegant embroidery and luxurious fabrics. Free delivery across India from Machilipatnam.",
  },
  "dress-materials": {
    dbName: "Dress Materials",
    title: "Dress Materials",
    subtitle: "Curated fabrics for bespoke elegance",
    seoDescription:
      "Explore designer dress materials at Mrudula Vastra. Premium unstitched fabrics and suit materials curated from India's finest weavers. Free shipping from Machilipatnam across India.",
  },
  kids: {
    dbName: "Kids Wear",
    title: "Kids Wear",
    subtitle: "Adorable ethnic wear crafted for little royals",
    seoDescription:
      "Buy adorable kids ethnic wear online at Mrudula Vastra. Traditional Indian outfits for children — festive lehengas, kurtas & more from Machilipatnam. Premium quality guaranteed.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const normalizedCategory = category.toLowerCase();
  const cat = CATEGORY_MAP[normalizedCategory] || {
    title: category.charAt(0).toUpperCase() + category.slice(1).replace("-", " "),
    seoDescription: `Explore our elegant collection of ${category.replace("-", " ")} at Mrudula Vastra.`,
  };

  return {
    title: `${cat.title} — Premium ${cat.title} Collection`,
    description: cat.seoDescription,
    alternates: {
      canonical: `https://mrudulavastra.in/collections/${category}`,
    },
    openGraph: {
      title: `${cat.title} | Mrudula Vastra`,
      description: cat.seoDescription,
      url: `https://mrudulavastra.in/collections/${category}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const normalizedCategory = category.toLowerCase();
  
  // Fallback for dynamically added categories
  const cat = CATEGORY_MAP[normalizedCategory] || {
    dbName: category.charAt(0).toUpperCase() + category.slice(1).replace("-", " "),
    title: category.charAt(0).toUpperCase() + category.slice(1).replace("-", " "),
    subtitle: `Explore our elegant collection of ${category.replace("-", " ")}.`,
  };

  const supabase = await createClient();

  const { data: products } = await (supabase as any)
    .from("products")
    .select("*")
    .ilike("category", cat.dbName)
    .order("id", { ascending: true });

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
      {/* Hero — Compact Horizontal Strip */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-6">
          <div className="min-w-0">
            <p className="hidden lg:block uppercase font-bold text-gold tracking-[0.5em] text-[9px] mb-2">
              Collection
            </p>
            <h1 className="font-playfair text-forest font-medium tracking-wide text-[22px] sm:text-[28px] lg:text-[34px] leading-tight">
              {cat.title}
            </h1>
          </div>
          <p className="hidden lg:block text-text-muted/60 font-dm text-[13px] italic whitespace-nowrap pb-1">
            {cat.subtitle}
          </p>
        </div>
      </section>

      {/* Grid with Search & Sort */}
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" /></div>}>
        <CategoryGrid products={products || []} categoryTitle={cat.title} />
      </Suspense>
    </main>
    <Footer />
    </>
  );
}
