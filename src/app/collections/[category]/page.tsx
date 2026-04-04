import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const revalidate = 0;

/* ── Slug → DB category mapping ──────────────────────── */
const CATEGORY_MAP: Record<string, { dbName: string; title: string; subtitle: string }> = {
  sarees: {
    dbName: "Sarees",
    title: "Sarees",
    subtitle: "Timeless drapes woven with heritage and grace",
  },
  "dress-materials": {
    dbName: "Dress Materials",
    title: "Dress Materials",
    subtitle: "Curated fabrics for bespoke elegance",
  },
  kids: {
    dbName: "Kids Wear",
    title: "Kids Wear",
    subtitle: "Adorable ethnic wear crafted for little royals",
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
    title: `${cat.title} — Mrudula Vastra`,
    description: cat.subtitle,
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
    <main className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Collections", href: "/collections" },
          { label: cat.title },
        ]}
      />

      {/* ── Hero Banner ──────────────────────────────── */}
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

      {/* ── Products Grid ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        {!products || products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted font-dm text-lg">
              No products found in this collection yet.
            </p>
            <Link
              href="/collections"
              className="inline-block mt-6 px-8 py-3 bg-forest text-white uppercase text-sm tracking-wider font-bold hover:bg-forest/90 transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product: any) => (
              <div key={product.id} className="group">
                {/* Image Container */}
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F5F0E8]">
                  {product.image && !product.image.includes("/api/placeholder") ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p
                        className="font-playfair text-forest/20 font-bold"
                        style={{ fontSize: "28px", letterSpacing: "0.1em" }}
                      >
                        MV
                      </p>
                      <p className="text-forest/15 font-dm text-[10px] uppercase tracking-[0.3em] mt-1">
                        Mrudula Vastra
                      </p>
                    </div>
                  )}

                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-forest text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold font-dm">
                      {product.badge}
                    </span>
                  )}

                  {product.tag && (
                    <span className="absolute top-3 right-3 bg-gold/90 text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold font-dm">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-playfair text-forest font-semibold text-lg leading-tight mb-1 group-hover:text-gold transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 font-dm">
                    <span className="text-forest font-semibold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.original_price > product.price && (
                      <span className="text-text-muted line-through text-sm">
                        ₹{product.original_price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-gold text-sm">★</span>
                      <span className="text-sm text-text-muted font-dm">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
