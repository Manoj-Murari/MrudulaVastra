import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
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
  const cat = CATEGORY_MAP[category];
  if (!cat) return { title: "Collection — Mrudula Vastra" };
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
  const cat = CATEGORY_MAP[category];
  if (!cat) notFound();

  const supabase = await createClient();

  const { data: products } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("category", cat.dbName)
    .order("id", { ascending: true });

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Collections", href: "/collections" },
          { label: cat.title },
        ]}
      />

      {/* Hero Banner */}
      <section className="relative py-16 lg:py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p
            className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
            style={{ fontSize: "11px" }}
          >
            Collection
          </p>
          <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-4">
            {cat.title}
          </h1>
          <p className="text-text-muted font-dm text-lg max-w-xl mx-auto">
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
