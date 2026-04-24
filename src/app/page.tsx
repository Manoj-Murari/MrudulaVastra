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
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

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
  const supabase = await createClient();

  // Run all independent queries in parallel for performance
  const [
    { data: categories },
    { data: products },
    { data: testimonials },
    { data: { user } }
  ] = await Promise.all([
    supabase.from("categories").select("*").order("id", { ascending: true }),
    supabase.from("products").select("*").order("id", { ascending: true }).limit(4),
    supabase.from("testimonials").select("*").order("id", { ascending: true }),
    supabase.auth.getUser()
  ]);

  let profile: any = null;
  if (user) {
    const { data } = await (supabase as any)
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        {profile?.full_name && (
          <div className="w-full bg-cream py-3.5 border-b border-gold/15 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center animate-fade-in">
              <p className="font-cormorant text-[1.1rem] lg:text-xl text-forest italic tracking-wide">
                Welcome back to Mrudula Vastra, {profile.full_name.split(' ')[0]} ✨
              </p>
            </div>
          </div>
        )}
        <HeroSection />
        <ScrollingDivider />
        <CategorySection categories={
          (categories || []).sort((a, b) => {
            const order = ["Sarees", "Kurtas", "Dress Materials", "Kids Wear"];
            const indexA = order.indexOf(a.title);
            const indexB = order.indexOf(b.title);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          })
        } />
        <ScrollingDivider />
        <TrendingSection products={products || []} />
        <InstagramBanner />
        <TestimonialsSection testimonials={testimonials || []} />
      </main>
      <Footer />
    </>
  );
}
