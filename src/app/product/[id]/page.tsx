import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import ReviewSection from "./ReviewSection";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Star } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

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

  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const priceText = `₹${product.price.toLocaleString("en-IN")}`;
  const discountText = discount > 0 ? ` (${discount}% Off)` : "";

  return {
    title: `${product.name} — ${product.category}`,
    description: `Buy ${product.name} at ${priceText}${discountText}. ${product.material ? `Crafted in luxurious ${product.material}.` : ""} Premium ${product.category.toLowerCase()} from Mrudula Vastra, Machilipatnam. ✓ Authentic ✓ Free shipping over ₹2000 ✓ 7-day returns.`,
    alternates: {
      canonical: `https://mrudulavastra.in/product/${id}`,
    },
    openGraph: {
      title: `${product.name} | Mrudula Vastra`,
      description: `Shop the ${product.name} at ${priceText}${discountText}. Premium ${product.category.toLowerCase()} — handpicked for elegance and tradition.`,
      type: "website",
      url: `https://mrudulavastra.in/product/${id}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 1067,
          alt: `${product.name} — ${product.category} by Mrudula Vastra, premium Indian ethnic wear`,
        },
        ...(product.gallery_images || []).slice(0, 3).map((img: string) => ({
          url: img,
          width: 800,
          height: 1067,
          alt: `${product.name} — Additional view`,
        })),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Mrudula Vastra`,
      description: `${product.name} at ${priceText}${discountText}. Premium ${product.category.toLowerCase()} from Machilipatnam.`,
      images: [product.image],
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
      <ProductJsonLd
        name={product.name}
        image={product.image}
        price={product.price}
        originalPrice={product.original_price}
        category={product.category}
        rating={product.rating}
        reviewCount={product.reviews}
        inStock={product.inventory_count > 0}
        productId={id}
        material={product.material}
        color={product.color}
        galleryImages={product.gallery_images}
      />
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
          <h1 className="font-playfair text-forest font-black lg:font-bold text-3xl lg:text-[34px] leading-snug mb-4">
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
            {relatedProducts.map((rp: Product) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      </main>
      <Footer />
    </>
  );
}
