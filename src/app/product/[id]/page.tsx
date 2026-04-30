import { createClient } from "@/lib/supabase/server";
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
