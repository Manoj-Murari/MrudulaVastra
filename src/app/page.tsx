import type { Metadata } from "next";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CategorySection from "@/components/sections/CategorySection";
import TrendingSection from "@/components/sections/TrendingSection";
import InstagramBanner from "@/components/sections/InstagramBanner";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ScrollingDivider from "@/components/ui/ScrollingDivider";
import { createPublicClient } from "@/lib/supabase/server";
import WelcomeBanner from "@/components/layout/WelcomeBanner";

export const revalidate = 300;

/* ── Homepage-specific metadata (overrides layout template) ──── */
export const metadata: Metadata = {
  title: "Mrudula Vastra — Premium Sarees & Ethnic Wear from Machilipatnam",
  description:
    "Shop handpicked sarees, elegant dress materials & adorable kids wear at Mrudula Vastra. Premium Indian ethnic wear from Machilipatnam, Andhra Pradesh. Kanjivaram, Banarasi, Pochampally, Chanderi silks. Nationwide delivery with free shipping over ₹2000.",
  alternates: {
    canonical: "https://mrudulavastra.in",
  },
};

export default async function HomePage() {
  const supabase = await createPublicClient();

  // Run all independent queries in parallel for performance
  const [
    { data: categories },
    { data: products },
    { data: testimonials }
  ] = await Promise.all([
    supabase.from("categories").select("*").order("id", { ascending: true }),
    supabase.from("products").select("*").eq("is_trending", true).order("id", { ascending: false }).limit(8),
    supabase.from("testimonials").select("*").order("id", { ascending: true })
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <WelcomeBanner />
        <HeroSection />
        <div className="hidden lg:block">
          <ScrollingDivider />
        </div>
        <CategorySection categories={
          (categories || []).map((cat: any) => {
            const title = cat?.title === "Kurtas" ? "Dresses" : cat?.title;
            const link = cat?.title === "Kurtas" ? "/collections/dresses" : cat?.link;
            let image = cat?.image;
            if (title === "Sarees" || title === "Saree") image = "/images/Saree.jpeg";
            if (title === "Dresses") image = "/images/Dresses.jpeg";
            if (title === "Dress Materials") image = "/images/Dress-Materials.jpeg";
            if (title === "Kids Wear") image = "/images/Kids-Wear.jpeg";
            return { ...cat, title, link, image };
          }).sort((a: any, b: any) => {
            const order = ["Sarees", "Dresses", "Dress Materials", "Kids Wear"];
            const indexA = order.indexOf(a?.title);
            const indexB = order.indexOf(b?.title);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          })
        } />
        <div className="hidden lg:block">
          <ScrollingDivider />
        </div>
        <TrendingSection products={products || []} />
        <InstagramBanner />
        <TestimonialsSection testimonials={testimonials || []} />
      </main>
      <Footer />
    </>
  );
}
