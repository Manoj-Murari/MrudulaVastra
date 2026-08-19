import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import ReviewSection from "./ReviewSection";
import ProductDetailsManager from "./ProductDetailsManager";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Star } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import type { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const revalidate = 300;

// Pre-generate all product pages as static HTML at build time.
// Users get instant CDN-cached responses with zero cold starts.
export async function generateStaticParams() {
  const supabase = await createPublicClient();
  const { data: products } = await (supabase as any)
    .from("products")
    .select("id");
  return (products || []).map((p: { id: string }) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();

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

  // Fetch color variants (linked products with same name)
  const { data: colorVariants } = await (supabase as any)
    .from("products")
    .select("id, color, image, inventory_count")
    .eq("name", product.name)
    .neq("id", id);

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

      <ProductDetailsManager product={product} colorVariants={colorVariants || []} />

      {/* Customer Reviews Section */}
      <ReviewSection 
        productId={id} 
        reviews={product.reviews} 
        rating={product.rating} 
      />

      {/* You May Also Like — mobile horizontal scroll, desktop 4-col grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="bg-cream py-10 sm:py-16 border-t border-gold/10 font-dm">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {/* Header */}
            <div className="flex items-end justify-between mb-6 sm:mb-10">
              <div>
                <p className="uppercase text-[9px] tracking-[0.4em] font-bold text-gold mb-1.5">From the Same Collection</p>
                <h2 className="font-playfair text-forest font-medium text-[22px] sm:text-[28px] tracking-wide">
                  You May Also Like
                </h2>
              </div>
              <Link
                href={`/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-forest/40 hover:text-gold transition-colors duration-300 hidden sm:block"
              >
                View All →
              </Link>
            </div>

            {/* Mobile: horizontal scroll | Desktop: 4-col grid */}
            <div className="-mx-6 sm:mx-0">
              <div className="flex sm:grid sm:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-6 sm:px-0 pb-2 sm:pb-0">
                {relatedProducts.map((rp: Product, idx: number) => (
                  <div key={rp.id} className="w-[58vw] sm:w-auto flex-shrink-0">
                    <ProductCard product={rp} priority={idx < 2} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile-only view all link */}
            <div className="mt-6 sm:hidden">
              <Link
                href={`/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full flex items-center justify-center gap-2 py-3 border border-forest/15 text-forest/60 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-forest/30 hover:text-forest transition-all"
              >
                View All {product.category}
              </Link>
            </div>
          </div>
        </section>
      )}

      </main>
      <Footer />
    </>
  );
}
