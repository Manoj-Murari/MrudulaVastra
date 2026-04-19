import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import ReviewSection from "./ReviewSection";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Star } from "lucide-react";
import Link from "next/link";

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

  // Fetch related products for "You may also like"
  const { data: relatedProducts } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", id)
    .limit(4);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb
        items={[
          { label: "Collections", href: "/collections" },
          { label: product.category, href: `/collections/${product.category.toLowerCase().replace(" ", "-")}` },
          { label: product.name },
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-20 flex flex-col lg:flex-row gap-10 lg:gap-24">
        <ProductGallery 
          primaryImage={product.image} 
          galleryImages={product.gallery_images} 
          productName={product.name} 
          badge={product.badge} 
          tag={product.tag} 
          isSoldOut={product.inventory_count === 0} 
        />

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

          <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gold/10">
            {product.reviews > 0 ? (
              <>
                <span className="text-[#1b7a66] text-lg">★</span>
                <span className="text-forest font-dm font-medium">
                  {product.rating}
                </span>
                <span className="text-text-muted font-dm">
                  ({product.reviews} reviews)
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-gray-300" strokeWidth={2.5} />
                ))}
                <span className="text-text-muted text-sm ml-2 font-dm">0 reviews</span>
              </div>
            )}
          </div>

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

      {/* Customer Reviews Section */}
      <ReviewSection 
        productId={id} 
        reviews={product.reviews} 
        rating={product.rating} 
      />

      {/* You may also like */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24 font-dm mt-8">
          <h2 className="text-lg lg:text-xl text-text-primary mb-8 text-left">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((rp: any) => (
              <Link key={rp.id} href={`/product/${rp.id}`} className="group block">
                 <div className="relative aspect-[3/4] bg-[#F5F0E8] overflow-hidden mb-3 border border-gold/10">
                   <Image 
                     src={rp.image} 
                     alt={rp.name} 
                     fill 
                     className="object-cover transition-transform duration-700 group-hover:scale-105"
                     sizes="(max-width: 640px) 50vw, 25vw"
                   />
                 </div>
                 <p className="uppercase text-[9px] text-text-muted mb-0.5 tracking-wider">{rp.category}</p>
                 <h3 className="font-playfair text-text-primary text-sm lg:text-[15px] font-semibold mb-1 truncate">{rp.name}</h3>
                 <div className="flex gap-2 items-baseline">
                   <span className="font-playfair text-forest font-bold text-sm lg:text-base">₹{rp.price.toLocaleString("en-IN")}</span>
                   {rp.original_price > rp.price && (
                     <span className="text-text-muted line-through text-[10px] lg:text-xs">₹{rp.original_price.toLocaleString("en-IN")}</span>
                   )}
                 </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      </main>
      <Footer />
    </>
  );
}
