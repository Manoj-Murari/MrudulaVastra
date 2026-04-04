import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Collections — Mrudula Vastra",
  description:
    "Explore our curated collections of sarees, dress materials, and kids wear — handpicked for elegance and tradition.",
};

const COLLECTIONS = [
  {
    slug: "sarees",
    title: "Sarees",
    subtitle: "Timeless drapes woven with heritage",
    gradient: "from-rose-50 to-amber-50",
  },
  {
    slug: "dress-materials",
    title: "Dress Materials",
    subtitle: "Curated fabrics for bespoke elegance",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    slug: "kids",
    title: "Kids Wear",
    subtitle: "Adorable ethnic wear for little royals",
    gradient: "from-violet-50 to-pink-50",
  },
];

export default async function CollectionsPage() {
  const supabase = await createClient();

  // Get a sample product image for each category to use as cover
  const coverImages: Record<string, string | null> = {};
  for (const col of COLLECTIONS) {
    const categoryName = col.slug === "dress-materials" ? "DRESS MATERIALS" : col.title.toUpperCase();
    const { data } = await (supabase as any)
      .from("products")
      .select("image")
      .ilike("category", categoryName)
      .limit(1)
      .single();
    coverImages[col.slug] = data?.image || null;
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p
            className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
            style={{ fontSize: "11px" }}
          >
            Browse
          </p>
          <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-4">
            Our Collections
          </h1>
          <p className="text-text-muted font-dm text-lg max-w-xl mx-auto">
            Discover handpicked ethnic wear curated across our signature categories.
          </p>
        </div>
      </section>

      {/* ── Collection Cards ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid gap-8">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group relative overflow-hidden bg-white border border-gold/10 hover:border-gold/30 transition-all duration-500"
              style={{ minHeight: "240px" }}
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Image half */}
                <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto bg-[#F5F0E8]">
                  {coverImages[col.slug] &&
                  !coverImages[col.slug]!.includes("/api/placeholder") ? (
                    <Image
                      src={coverImages[col.slug]!}
                      alt={col.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-playfair text-forest/15 text-3xl font-bold tracking-widest">
                        MV
                      </p>
                    </div>
                  )}
                </div>

                {/* Text half */}
                <div className="flex-1 flex flex-col justify-center p-8 lg:p-12">
                  <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
                    Collection
                  </p>
                  <h2 className="font-playfair text-forest font-bold text-3xl lg:text-4xl mb-3 group-hover:text-gold transition-colors duration-300">
                    {col.title}
                  </h2>
                  <p className="text-text-muted font-dm text-base mb-6">
                    {col.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 text-forest font-dm font-semibold text-sm uppercase tracking-wider group-hover:gap-4 transition-all duration-300">
                    Shop Now
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="transition-transform group-hover:translate-x-1 duration-300"
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
