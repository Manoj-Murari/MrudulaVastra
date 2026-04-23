import type { Metadata } from "next";
import Link from "next/link";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "About Mrudula Vastra — The Founder's Story",
  description:
    "Discover the story behind Mrudula Vastra — a passion-driven digital Indian ethnic wear boutique. Steered from Mumbai, rooted in Machilipatnam.",
  alternates: {
    canonical: "https://mrudulavastra.in/about",
  },
  openGraph: {
    title: "About Mrudula Vastra — The Founder's Story",
    description:
      "Where modern vision meets traditional soul. Discover our curated collection of sarees, dress materials, and kids' wear.",
    url: "https://mrudulavastra.in/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      
      {/* ── HIGH FASHION COMPACT EDITORIAL ───────────────────────────── */}
      <main className="bg-cream text-forest min-h-screen overflow-hidden selection:bg-gold/20 selection:text-forest flex flex-col">
        
        <div className="flex-1 flex flex-col justify-center py-16 lg:py-0">
          <section className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <AnimatedSection direction="up" className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
              
              {/* ── Left Column: Title & CTA ───────────────────────────── */}
              <div className="lg:col-span-5 flex flex-col h-full justify-center">
                <div>
                  <p className="uppercase tracking-[0.4em] text-[9px] text-forest/50 mb-8 font-dm font-semibold">
                    The Heritage of Mrudula Vastra
                  </p>
                  <h1 className="font-playfair font-light text-5xl md:text-6xl lg:text-[72px] leading-[1.05] tracking-tight mb-8">
                    Two Tech Minds.
                    <br />
                    <span className="italic text-gold">One Timeless Passion.</span>
                  </h1>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:block mt-12">
                  <Link
                    href="/collections"
                    className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden bg-transparent border border-forest/20"
                  >
                    <div className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-forest font-dm font-bold group-hover:text-cream transition-colors duration-700">
                      Enter The Boutique
                    </span>
                  </Link>
                </div>
              </div>

              {/* ── Right Column: Story & Grid ───────────────────────────── */}
              <div className="lg:col-span-7 flex flex-col">
                
                {/* The Letter */}
                <div className="space-y-6 font-dm text-lg lg:text-xl leading-[1.8] text-forest/90 font-light lg:border-l border-gold/30 lg:pl-16">
                  <p>
                    Hi, I&apos;m Bhavani — a Software Engineer by profession, and a lover of handpicked fabrics by heart.
                  </p>
                  <p>
                    Together with my husband, what started as a curated Instagram grid of sarees, dress materials, and kids&apos; wear soon found its feet at the festive stalls of Bhimavaram, where fabric met fingers and digital dreams turned real.
                  </p>
                  <p>
                    Steered from Mumbai, energized by Bhimavaram, and rooted in the heritage of Machilipatnam — Mrudula Vastra is where <span className="italic text-gold">modern vision meets traditional soul</span>.
                  </p>
                  
                  <div className="pt-6">
                    <p className="font-playfair italic text-3xl text-forest/80">
                      — Bhavani & Balaji
                    </p>
                  </div>
                </div>

                {/* The Architectural Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gold/30 border-y border-gold/30 py-8 lg:ml-16">
                  
                  <div className="flex flex-col items-center md:items-start px-6 py-4 md:py-0">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-forest/40 mb-3 font-dm font-semibold">Steered From</p>
                    <h3 className="font-dm uppercase tracking-widest text-xs text-forest mb-2">Mumbai</h3>
                    <p className="font-playfair italic text-forest/60 text-sm">Modern Vision</p>
                  </div>

                  <div className="flex flex-col items-center md:items-center px-6 py-4 md:py-0">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-forest/40 mb-3 font-dm font-semibold">Energized By</p>
                    <h3 className="font-dm uppercase tracking-widest text-xs text-forest mb-2">Bhimavaram</h3>
                    <p className="font-playfair italic text-forest/60 text-sm">Festive Stalls</p>
                  </div>

                  <div className="flex flex-col items-center md:items-end px-6 py-4 md:py-0">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-forest/40 mb-3 font-dm font-semibold">Rooted In</p>
                    <h3 className="font-dm uppercase tracking-widest text-xs text-forest mb-2">Machilipatnam</h3>
                    <p className="font-playfair italic text-forest/60 text-sm">Heritage Weaves</p>
                  </div>

                </div>

                {/* Mobile CTA */}
                <div className="block lg:hidden mt-12 text-center">
                  <Link
                    href="/collections"
                    className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden bg-transparent border border-forest/20 w-full"
                  >
                    <div className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-forest font-dm font-bold group-hover:text-cream transition-colors duration-700">
                      Enter The Boutique
                    </span>
                  </Link>
                </div>

              </div>

            </AnimatedSection>
          </section>
        </div>

      </main>
      <Footer />
    </>
  );
}
