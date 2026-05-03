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
  "kids-wear": {
    dbName: "Kids Wear",
    title: "Kids Wear",
    subtitle: "Adorable ethnic wear crafted for little royals",
    seoDescription:
      "Buy adorable kids ethnic wear online at Mrudula Vastra. Traditional Indian outfits for children — festive lehengas, kurtas & more from Machilipatnam. Premium quality guaranteed.",
  },
  "kids": {
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
  const decodedCategory = decodeURIComponent(category);
  const normalizedCategory = decodedCategory.toLowerCase().replace(/\s+/g, '-');
  const cat = CATEGORY_MAP[normalizedCategory] || {
    title: decodedCategory.split(/[- ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    seoDescription: `Explore our elegant collection of ${decodedCategory.replace(/[-]/g, " ")} at Mrudula Vastra.`,
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
  params: Promise<{ category: string }> | { category: string };
}) {
  console.log("Category params received:", params);
  const resolvedParams = typeof (params as any).then === "function" ? await params : (params as any);
  const { category } = resolvedParams;
  const decodedCategory = decodeURIComponent(category || "");
  const normalizedCategory = decodedCategory.toLowerCase().replace(/\s+/g, '-');
  
  // Fallback for dynamically added categories
  const cat = CATEGORY_MAP[normalizedCategory] || {
    dbName: decodedCategory.split(/[- ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    title: decodedCategory.split(/[- ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    subtitle: `Explore our elegant collection of ${decodedCategory.replace(/[-]/g, " ")}.`,
  };

  const supabase = await createClient();

  // Fetch all unique categories for the filter bar
  const { data: allProducts } = await (supabase as any)
    .from("products")
    .select("category");
  
  const uniqueCategories = Array.from(new Set((allProducts as any[] || []).map(p => p.category).filter(Boolean)));

  // Sort categories according to preferred order
  const PREFERRED_ORDER = ["Sarees", "Dresses", "Dress Materials", "Kids Wear"];
  const sortedCategories = uniqueCategories.sort((a, b) => {
    const indexA = PREFERRED_ORDER.indexOf(a);
    const indexB = PREFERRED_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

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
        <CategoryGrid 
          products={products || []} 
          categoryTitle={cat.title} 
          initialCategories={sortedCategories}
        />
      </Suspense>
    </main>
    <Footer />
    </>
  );
}
