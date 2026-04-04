import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CategorySection from "@/components/sections/CategorySection";
import TrendingSection from "@/components/sections/TrendingSection";
import InstagramBanner from "@/components/sections/InstagramBanner";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <TrendingSection />
        <InstagramBanner />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
