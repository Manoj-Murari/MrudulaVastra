import type { Metadata } from "next";
import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Mail } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Returns & Exchange — Mrudula Vastra",
  description:
    "Learn about Mrudula Vastra's hassle-free return and exchange policy for sarees, dress materials, and kids wear.",
};

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Initiate Request",
    text: "Email us at mrudulavastra@gmail.com or call +91 7208903117 within 7 days of delivery with your order number and reason.",
  },
  {
    step: "02",
    title: "Approval & Pickup",
    text: "Once approved, we'll arrange a reverse pickup from your address. Keep the product in its original packaging.",
  },
  {
    step: "03",
    title: "Quality Check",
    text: "Upon receiving the product, our team will inspect it within 2–3 business days to verify the condition.",
  },
  {
    step: "04",
    title: "Refund or Exchange",
    text: "Once approved, your refund will be processed within 5–7 business days, or we'll ship the exchange product immediately.",
  },
];

const ELIGIBLE = [
  "Product received is damaged or defective",
  "Wrong product delivered (different from what was ordered)",
  "Size mismatch (for dress materials and kids wear)",
  "Product significantly different from the website images",
  "Missing items from the order",
];

const NOT_ELIGIBLE = [
  "Products used, washed, or altered after delivery",
  "Products without original tags and packaging",
  "Sale or discounted items (unless defective)",
  "Returns initiated after 7 days of delivery",
  "Customized or made-to-order products",
  "Products damaged due to customer mishandling",
];

export default function ReturnsPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb items={[{ label: "Returns & Exchange" }]} />

        {/* Hero */}
        <section className="relative py-20 lg:py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <p
              className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
              style={{ fontSize: "11px" }}
            >
              Returns & Exchange
            </p>
            <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
              Hassle-Free
              <br />
              Returns & Exchanges
            </h1>
            <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
              Your satisfaction is our priority. If something isn&apos;t right, we make
              the return and exchange process simple and straightforward.
            </p>
          </div>
        </section>

        {/* Quick Info Bar */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-16">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: RotateCcw, title: "7-Day Return Window", sub: "From delivery date" },
              { icon: Clock, title: "5–7 Day Refund", sub: "After quality check" },
              { icon: Mail, title: "Easy Initiation", sub: "Email or call us" },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-forest text-center"
              >
                <item.icon size={24} className="text-gold mx-auto mb-3" />
                <h3 className="font-playfair text-white font-bold text-lg mb-1">
                  {item.title}
                </h3>
                <p className="text-white/60 font-dm text-sm">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process Steps */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="text-center mb-12">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
              How It Works
            </p>
            <h2 className="font-playfair text-forest font-bold text-3xl">
              Return Process
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step} className="bg-white border border-gold/10 p-8">
                <span className="text-gold/40 font-playfair text-4xl font-bold">{s.step}</span>
                <h3 className="font-dm text-forest font-semibold text-base mt-3 mb-2">
                  {s.title}
                </h3>
                <p className="text-text-muted font-dm text-sm leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-24">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Eligible */}
            <div className="bg-white border border-gold/10 p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={22} className="text-green-600" />
                <h3 className="font-playfair text-forest font-bold text-xl">
                  Eligible for Return
                </h3>
              </div>
              <ul className="space-y-3">
                {ELIGIBLE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-text-muted font-dm text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Eligible */}
            <div className="bg-white border border-gold/10 p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <XCircle size={22} className="text-red-500" />
                <h3 className="font-playfair text-forest font-bold text-xl">
                  Not Eligible
                </h3>
              </div>
              <ul className="space-y-3">
                {NOT_ELIGIBLE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle size={14} className="text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-text-muted font-dm text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Note */}
          <div className="mt-8 bg-forest/5 border border-forest/10 p-6 flex items-start gap-4">
            <AlertTriangle size={20} className="text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-dm text-forest font-semibold text-sm mb-1">
                Important Note
              </p>
              <p className="text-text-muted font-dm text-sm leading-relaxed">
                We recommend recording an unboxing video when you receive your order. 
                This helps expedite the return process in case of any issues with the product.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
