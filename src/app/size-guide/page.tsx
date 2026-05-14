import type { Metadata } from "next";
import { Ruler, Scissors, Info } from "lucide-react";
import Image from "next/image";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Size Guide — Mrudula Vastra",
  description:
    "Find the perfect fit with Mrudula Vastra's comprehensive size guide for tops, dresses, sets, bottoms, kids wear, sarees, and dress materials.",
};

const TOPS_SIZES = [
  { size: "XS", bust: '32"', waist: '24–26"', hip: '34–36"', label: "Extra Small" },
  { size: "S", bust: '34"', waist: '26–28"', hip: '36–38"', label: "Small" },
  { size: "M", bust: '36"', waist: '28–30"', hip: '38–40"', label: "Medium" },
  { size: "L", bust: '38"', waist: '30–32"', hip: '40–42"', label: "Large" },
  { size: "XL", bust: '40"', waist: '32–34"', hip: '42–44"', label: "Extra Large" },
  { size: "XXL", bust: '42"', waist: '34–36"', hip: '44–46"', label: "Double XL" },
  { size: "3XL", bust: '44"', waist: '36–38"', hip: '46–48"', label: "Triple XL" },
];

const BOTTOMS_SIZES = [
  { size: "XS", waist: '24–26"', hip: '34–36"' },
  { size: "S", waist: '26–28"', hip: '36–38"' },
  { size: "M", waist: '28–30"', hip: '38–40"' },
  { size: "L", waist: '30–32"', hip: '40–42"' },
  { size: "XL", waist: '32–34"', hip: '42–44"' },
];

const SAREE_SPECS = [
  { label: "Standard Saree Length", value: "5.5 meters (approx. 18 feet)" },
  { label: "Blouse Piece", value: "0.8 to 1 meter (included with most sarees)" },
  { label: "Saree Width", value: "44 to 47 inches" },
  { label: "Pallu Length", value: "Varies by design (30–40 inches typically)" },
];

const DRESS_MATERIAL_SPECS = [
  { label: "Top Fabric", value: "2.5 meters (unstitched)" },
  { label: "Bottom Fabric", value: "2.5 meters (unstitched)" },
  { label: "Dupatta", value: "2.25 to 2.5 meters" },
  { label: "Fabric Width", value: "36 to 44 inches" },
];

const KIDS_SIZES = [
  { age: "1–2 Years", chest: '20"', length: '16"', shoulder: '8"' },
  { age: "2–3 Years", chest: '22"', length: '18"', shoulder: '9"' },
  { age: "3–4 Years", chest: '24"', length: '20"', shoulder: '9.5"' },
  { age: "4–5 Years", chest: '26"', length: '22"', shoulder: '10"' },
  { age: "5–6 Years", chest: '27"', length: '24"', shoulder: '10.5"' },
  { age: "6–7 Years", chest: '28"', length: '26"', shoulder: '11"' },
  { age: "7–8 Years", chest: '30"', length: '28"', shoulder: '11.5"' },
  { age: "8–9 Years", chest: '31"', length: '29"', shoulder: '11.75"' },
  { age: "9–10 Years", chest: '32"', length: '30"', shoulder: '12"' },
  { age: "10–12 Years", chest: '34"', length: '34"', shoulder: '13"' },
];

const HOW_TO_MEASURE = [
  {
    title: "Bust",
    text: "Measure around the fullest part of the chest, keeping the tape level and snug but not tight.",
  },
  {
    title: "Waist",
    text: "Measure around the narrowest part of the waist, typically just above the belly button.",
  },
  {
    title: "Hip",
    text: "Measure around the fullest part of the hips, keeping the tape level all the way around.",
  },
];

const MEASUREMENT_TIPS = [
  {
    title: "Use a Soft Measuring Tape",
    text: "Always use a flexible, soft tape measure for accurate body measurements. Avoid using a rigid ruler.",
  },
  {
    title: "Measure Over Light Clothing",
    text: "Take measurements while wearing thin, form-fitting clothing for the most accurate results.",
  },
  {
    title: "Stand Naturally",
    text: "Stand relaxed with arms at your sides. Don't hold your breath or suck in your stomach.",
  },
];

export default function SizeGuidePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb items={[{ label: "Size Guide" }]} />

        {/* Hero */}
        <section className="relative py-20 lg:py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <p
              className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
              style={{ fontSize: "11px" }}
            >
              Size Guide
            </p>
            <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
              Find Your
              <br />
              Perfect Fit
            </h1>
            <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
              Use our detailed size charts and measurement tips to find the ideal fit
              for every garment in our collection.
            </p>
          </div>
        </section>

        {/* Tops / Dresses / Sets Size Chart */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Ruler size={22} className="text-gold" />
              <h2 className="font-playfair text-forest font-bold text-2xl">
                Tops / Dresses / Sets
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/15">
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Bust (in)
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Waist (in)
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Hip (in)
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider hidden sm:table-cell">
                      Label
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TOPS_SIZES.map((row) => (
                    <tr key={row.size} className="border-b border-gold/5">
                      <td className="py-4 font-dm text-forest text-sm font-bold">{row.size}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{row.bust}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{row.waist}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{row.hip}</td>
                      <td className="py-4 font-dm text-text-muted/70 text-sm hidden sm:table-cell">{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottoms / Pants Size Chart */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Scissors size={22} className="text-gold" />
              <h2 className="font-playfair text-forest font-bold text-2xl">
                Bottoms / Pants
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/15">
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Waist (in)
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Hip (in)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BOTTOMS_SIZES.map((row) => (
                    <tr key={row.size} className="border-b border-gold/5">
                      <td className="py-4 font-dm text-forest text-sm font-bold">{row.size}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{row.waist}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Saree Specs */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Ruler size={22} className="text-gold" />
              <h2 className="font-playfair text-forest font-bold text-2xl">
                Saree Specifications
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/15">
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Component
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Measurement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SAREE_SPECS.map((spec) => (
                    <tr key={spec.label} className="border-b border-gold/5">
                      <td className="py-4 font-dm text-forest text-sm">{spec.label}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Dress Material Specs */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Scissors size={22} className="text-gold" />
              <h2 className="font-playfair text-forest font-bold text-2xl">
                Dress Material Specifications
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/15">
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Component
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Measurement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DRESS_MATERIAL_SPECS.map((spec) => (
                    <tr key={spec.label} className="border-b border-gold/5">
                      <td className="py-4 font-dm text-forest text-sm">{spec.label}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Kids Wear Size Chart */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Info size={22} className="text-gold" />
              <h2 className="font-playfair text-forest font-bold text-2xl">
                Kids Wear Size Chart
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/15">
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Age
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Chest
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Length
                    </th>
                    <th className="text-left py-3 font-dm text-forest font-semibold text-sm uppercase tracking-wider">
                      Shoulder
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {KIDS_SIZES.map((size) => (
                    <tr key={size.age} className="border-b border-gold/5">
                      <td className="py-4 font-dm text-forest text-sm font-medium">{size.age}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{size.chest}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{size.length}</td>
                      <td className="py-4 font-dm text-text-muted text-sm">{size.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-text-muted/70 font-dm text-xs italic">
              * Sizes are approximate and may vary slightly between products. Please
              refer to individual product pages for specific measurements.
            </p>
          </div>
        </section>

        {/* How to Measure + Tips */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24">
          <div className="text-center mb-12">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
              Tips
            </p>
            <h2 className="font-playfair text-forest font-bold text-3xl">
              How to Measure
            </h2>
          </div>

          {/* Measurement Guide Illustration */}
          <div className="flex justify-center mb-12">
            <div className="bg-white border border-gold/10 p-6 lg:p-8 inline-block shadow-sm">
              <Image
                src="/measurement-guide.png"
                alt="How to measure - Bust, Waist and Hip measurement guide"
                width={360}
                height={480}
                className="mx-auto"
                style={{ maxHeight: "420px", width: "auto" }}
              />
            </div>
          </div>

          {/* Key measurements */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {HOW_TO_MEASURE.map((item) => (
              <div
                key={item.title}
                className="bg-forest/5 border border-forest/10 p-6 text-center"
              >
                <h3 className="font-playfair text-forest font-bold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-text-muted font-dm text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* General tips */}
          <div className="grid sm:grid-cols-3 gap-6">
            {MEASUREMENT_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="bg-white border border-gold/10 p-6 hover:border-gold/25 transition-colors duration-300"
              >
                <h3 className="font-dm text-forest font-semibold text-sm mb-2">
                  {tip.title}
                </h3>
                <p className="text-text-muted font-dm text-sm leading-relaxed">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
