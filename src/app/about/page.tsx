import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Mrudula Vastra",
  description:
    "Discover the story behind Mrudula Vastra — a passion for authentic Indian ethnic wear, handpicked from the finest weavers across India.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p
            className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
            style={{ fontSize: "11px" }}
          >
            Our Story
          </p>
          <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
            Elegance Woven in
            <br />
            Every Thread
          </h1>
          <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
            Born from a deep reverence for India&apos;s textile heritage, Mrudula Vastra
            is more than a brand — it is a celebration of artistry, tradition, and
            timeless grace.
          </p>
        </div>
      </section>

      {/* ── Story Sections ───────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24 space-y-20">
        {/* Heritage */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-[#F5F0E8] aspect-[4/5] flex items-center justify-center">
            <div className="text-center">
              <p className="font-playfair text-forest/20 text-5xl font-bold tracking-widest">
                MV
              </p>
              <p className="text-forest/15 font-dm text-[10px] uppercase tracking-[0.3em] mt-2">
                Est. 2024
              </p>
            </div>
          </div>
          <div>
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
              Heritage
            </p>
            <h2 className="font-playfair text-forest font-bold text-3xl mb-5">
              Rooted in Vijayawada
            </h2>
            <p className="text-text-muted font-dm leading-relaxed mb-4">
              From the bustling textile markets of Vijayawada to your doorstep, we
              travel across the heartland of Indian weaving traditions — from
              Kanjivaram to Banarasi, from Chanderi to Pochampally — to bring you
              fabrics that tell stories.
            </p>
            <p className="text-text-muted font-dm leading-relaxed">
              Each piece in our collection is handpicked by our founder, ensuring
              that only the most exquisite weaves make it to our shelves. We believe
              that every saree is a canvas, and every weaver is an artist.
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
              Philosophy
            </p>
            <h2 className="font-playfair text-forest font-bold text-3xl mb-5">
              Curation Over Mass Production
            </h2>
            <p className="text-text-muted font-dm leading-relaxed mb-4">
              We don&apos;t chase trends. We seek timelessness. Every dress material,
              every kids&apos; outfit, every saree in our collection is chosen for its
              craftsmanship, its story, and its ability to make you feel extraordinary.
            </p>
            <p className="text-text-muted font-dm leading-relaxed">
              Our commitment is to the artisans who pour their lives into every
              thread, and to you — the discerning connoisseur who values authenticity.
            </p>
          </div>
          <div className="order-1 md:order-2 bg-[#F5F0E8] aspect-[4/5] flex items-center justify-center">
            <div className="text-center space-y-6">
              <div>
                <p className="font-playfair text-forest/30 text-4xl font-bold">500+</p>
                <p className="text-forest/20 font-dm text-xs uppercase tracking-wider mt-1">
                  Curated Pieces
                </p>
              </div>
              <div className="w-12 h-px bg-gold/30 mx-auto" />
              <div>
                <p className="font-playfair text-forest/30 text-4xl font-bold">50+</p>
                <p className="text-forest/20 font-dm text-xs uppercase tracking-wider mt-1">
                  Artisan Partners
                </p>
              </div>
              <div className="w-12 h-px bg-gold/30 mx-auto" />
              <div>
                <p className="font-playfair text-forest/30 text-4xl font-bold">12+</p>
                <p className="text-forest/20 font-dm text-xs uppercase tracking-wider mt-1">
                  Weaving Traditions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center">
          <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
            Our Values
          </p>
          <h2 className="font-playfair text-forest font-bold text-3xl mb-12">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Authenticity",
                text: "Every piece is sourced directly from master weavers and verified for originality.",
              },
              {
                title: "Sustainability",
                text: "We champion handloom traditions that preserve the environment and empower communities.",
              },
              {
                title: "Accessibility",
                text: "Premium ethnic wear should be within everyone's reach, without compromising on quality.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="p-8 bg-white border border-gold/10 hover:border-gold/25 transition-colors duration-300"
              >
                <h3 className="font-playfair text-forest font-bold text-xl mb-3">
                  {value.title}
                </h3>
                <p className="text-text-muted font-dm text-sm leading-relaxed">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visit Us CTA */}
        <div className="bg-forest text-white p-10 lg:p-16 text-center">
          <p className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4 text-[10px]">
            Visit Us
          </p>
          <h2 className="font-playfair font-bold text-3xl mb-6">
            Experience Our Collection In Person
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70 font-dm text-sm">
            <span className="flex items-center gap-2">
              <MapPin size={16} /> Vijayawada, Andhra Pradesh
            </span>
            <span className="hidden sm:block text-white/30">|</span>
            <span className="flex items-center gap-2">
              <Phone size={16} /> +91 98765 43210
            </span>
            <span className="hidden sm:block text-white/30">|</span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> Mon–Sat, 10 AM – 8 PM
            </span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-white/70 font-dm text-sm">
            <Mail size={16} />
            <span>hello@mrudulavatra.com</span>
          </div>
        </div>
      </section>
    </main>
  );
}
