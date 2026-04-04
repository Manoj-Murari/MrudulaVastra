import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CategorySection from "@/components/sections/CategorySection";
import TrendingSection from "@/components/sections/TrendingSection";
import InstagramBanner from "@/components/sections/InstagramBanner";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  // Run all independent queries in parallel for performance
  const [
    { data: categories },
    { data: products },
    { data: testimonials },
  ] = await Promise.all([
    supabase.from("categories").select("*").order("id", { ascending: true }),
    supabase.from("products").select("*").order("id", { ascending: true }).limit(4),
    supabase.from("testimonials").select("*").order("id", { ascending: true }),
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <CategorySection categories={categories || []} />
        <TrendingSection products={products || []} />
        <InstagramBanner />
        <TestimonialsSection testimonials={testimonials || []} />
      </main>
      <Footer />
    </>
  );
}
