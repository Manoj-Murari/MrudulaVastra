import type { Metadata } from "next";
import { Truck, Clock, MapPin, Package, ShieldCheck, IndianRupee } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Shipping Policy — Mrudula Vastra",
  description:
    "Learn about Mrudula Vastra's shipping policies, delivery timelines, and charges for sarees, dress materials, and kids wear across India.",
};

const SHIPPING_HIGHLIGHTS = [
  {
    icon: Truck,
    title: "Pan-India Delivery",
    text: "We deliver to all major cities and towns across India through trusted courier partners.",
  },
  {
    icon: Clock,
    title: "5–7 Business Days",
    text: "Standard delivery typically takes 5–7 business days from the date of order confirmation.",
  },
  {
    icon: IndianRupee,
    title: "Free Shipping Above ₹1,999",
    text: "Enjoy free shipping on all prepaid orders above ₹1,999. A flat ₹99 fee applies below this amount.",
  },
  {
    icon: Package,
    title: "Premium Packaging",
    text: "Every order is carefully packed in branded gift-quality packaging to preserve the fabric's beauty.",
  },
  {
    icon: ShieldCheck,
    title: "Insured Shipments",
    text: "All shipments are insured against damage or loss during transit for your peace of mind.",
  },
  {
    icon: MapPin,
    title: "Order Tracking",
    text: "Track your order in real-time with the tracking link sent to your registered email and phone.",
  },
];

const SHIPPING_DETAILS = [
  {
    question: "What are the shipping charges?",
    answer:
      "We offer free shipping on all prepaid orders above ₹1,999. For orders below ₹1,999, a flat shipping fee of ₹99 is applicable. Cash on Delivery (COD) orders carry an additional ₹49 handling charge.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 5–7 business days for metro cities and 7–10 business days for other locations. Processing time is 1–2 business days before dispatch.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently, we only ship within India. We are working on expanding our shipping to international destinations. Stay tuned for updates!",
  },
  {
    question: "How will my order be packed?",
    answer:
      "Each product is carefully folded with tissue paper and placed in our signature branded box with a protective outer cover. Sarees receive additional care with a silica gel packet to prevent moisture damage.",
  },
  {
    question: "Can I change my shipping address after placing an order?",
    answer:
      "Address changes can be made within 12 hours of placing the order by contacting us at mrudulavastra@gmail.com or calling +91 7208903117. Once the order is dispatched, address changes are not possible.",
  },
  {
    question: "What if my order is delayed?",
    answer:
      "While we strive to deliver on time, occasional delays due to weather, festivals, or courier issues may occur. If your order is delayed beyond the estimated delivery date, please contact our customer care team.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb items={[{ label: "Shipping Policy" }]} />

        {/* Hero */}
        <section className="relative py-20 lg:py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <p
              className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
              style={{ fontSize: "11px" }}
            >
              Shipping Policy
            </p>
            <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
              Delivering Elegance
              <br />
              to Your Doorstep
            </h1>
            <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
              We ensure your handpicked ethnic wear reaches you safely, beautifully
              packaged, and right on time.
            </p>
          </div>
        </section>

        {/* Highlights Grid */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHIPPING_HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="p-8 bg-white border border-gold/10 hover:border-gold/25 transition-colors duration-300"
              >
                <item.icon size={24} className="text-gold mb-4" />
                <h3 className="font-playfair text-forest font-bold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-text-muted font-dm text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Q&A */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24">
          <div className="text-center mb-12">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
              Details
            </p>
            <h2 className="font-playfair text-forest font-bold text-3xl">
              Shipping FAQs
            </h2>
          </div>
          <div className="space-y-6">
            {SHIPPING_DETAILS.map((item) => (
              <div
                key={item.question}
                className="bg-white border border-gold/10 p-6 lg:p-8"
              >
                <h3 className="font-dm text-forest font-semibold text-base mb-3">
                  {item.question}
                </h3>
                <p className="text-text-muted font-dm text-sm leading-relaxed">
                  {item.answer}
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
