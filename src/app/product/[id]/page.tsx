import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductActions from "./ProductActions";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — Mrudula Vastra`,
    description: `Shop the ${product.name} online at Mrudula Vastra. Elegance woven in every thread.`,
    openGraph: {
      title: `${product.name} | Mrudula Vastra`,
      description: `Shop the ${product.name} online at Mrudula Vastra. Elegance woven in every thread.`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 1067,
          alt: product.name,
        },
      ],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-cream">
      <Breadcrumb
        items={[
          { label: "Collections", href: "/collections" },
          { label: product.category, href: `/collections/${product.category.toLowerCase().replace(" ", "-")}` },
          { label: product.name },
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-20 flex flex-col lg:flex-row gap-10 lg:gap-24">
        {/* Left Side: Image — full width on mobile, sticky on desktop */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-[3/4] lg:sticky lg:top-[120px] bg-[#F5F0E8] overflow-hidden">
            {product.image && !product.image.includes("/api/placeholder") ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-playfair text-forest/20 font-bold text-4xl tracking-widest mb-2">MV</p>
                <p className="text-forest/15 font-dm text-xs uppercase tracking-[0.3em]">Mrudula Vastra</p>
              </div>
            )}
            {product.badge && (
              <span className="absolute top-4 left-4 bg-forest text-white px-4 py-1.5 text-xs uppercase tracking-wider font-bold font-dm">
                {product.badge}
              </span>
            )}
            {product.tag && (
              <span className="absolute top-4 right-4 bg-gold/90 text-white px-4 py-1.5 text-xs uppercase tracking-wider font-bold font-dm">
                {product.tag}
              </span>
            )}
            {/* Sold Out Overlay */}
            {product.inventory_count === 0 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="px-5 py-2 bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] font-dm">
                  Sold Out
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-dm mb-2">
            {product.category}
          </p>
          <h1 className="font-playfair text-forest font-bold text-3xl lg:text-5xl leading-tight mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-playfair text-forest font-bold text-2xl lg:text-3xl">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.original_price > product.price && (
              <span className="text-text-muted line-through text-lg">
                ₹{product.original_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gold/10">
              <span className="text-gold text-lg">★</span>
              <span className="text-forest font-dm font-medium">
                {product.rating}
              </span>
              <span className="text-text-muted font-dm">
                ({product.reviews} reviews)
              </span>
            </div>
          )}

          {/* Specs */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
            {product.material && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted font-dm mb-1">Material</p>
                <p className="font-playfair text-forest text-lg font-semibold">{product.material}</p>
              </div>
            )}
            {product.color && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted font-dm mb-1">Color</p>
                <p className="font-playfair text-forest text-lg font-semibold">{product.color}</p>
              </div>
            )}
          </div>

          <ProductActions product={product} isSoldOut={product.inventory_count === 0} />

          <div className="mt-12 space-y-4 font-dm text-sm text-text-muted">
            <p className="flex items-center gap-3">
              <span className="text-gold">✓</span> 100% Authentic Product
            </p>
            <p className="flex items-center gap-3">
              <span className="text-gold">✓</span> Free shipping on orders over ₹2000
            </p>
            <p className="flex items-center gap-3">
              <span className="text-gold">✓</span> 7-day return/exchange available
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
