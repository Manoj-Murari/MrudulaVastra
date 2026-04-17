"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, MapPin, Clock } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TRACKING_STEPS = [
  {
    icon: Package,
    title: "Order Placed",
    text: "Your order has been confirmed and is being prepared.",
  },
  {
    icon: CheckCircle,
    title: "Order Processed",
    text: "Your items have been quality-checked and packed with care.",
  },
  {
    icon: Truck,
    title: "Shipped",
    text: "Your order is on its way! Track it with the courier tracking link.",
  },
  {
    icon: MapPin,
    title: "Delivered",
    text: "Your order has been delivered. Enjoy your beautiful ethnic wear!",
  },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb items={[{ label: "Track Your Order" }]} />

        {/* Hero */}
        <section className="relative py-20 lg:py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <p
              className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
              style={{ fontSize: "11px" }}
            >
              Order Tracking
            </p>
            <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
              Track Your
              <br />
              Order
            </h1>
            <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
              Enter your order ID to check the current status of your delivery.
            </p>
          </div>
        </section>

        {/* Track Form */}
        <section className="max-w-2xl mx-auto px-6 lg:px-10 pb-12">
          <div className="bg-white border border-gold/10 p-8 lg:p-10">
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label
                  htmlFor="order-id"
                  className="block text-forest font-dm font-medium text-sm mb-2"
                >
                  Order ID
                </label>
                <input
                  id="order-id"
                  type="text"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="e.g. MV-20260412-0087"
                  className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-forest/90 transition-colors flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Track Order
              </button>
            </form>

            {submitted && (
              <div className="mt-8 p-6 bg-cream border border-gold/10">
                <p className="text-text-muted font-dm text-sm text-center leading-relaxed">
                  We are working on integrating real-time order tracking. For now, please
                  contact us at{" "}
                  <a
                    href="mailto:mrudulavastra@gmail.com"
                    className="text-forest font-medium hover:text-gold transition-colors"
                  >
                    mrudulavastra@gmail.com
                  </a>{" "}
                  or call{" "}
                  <a
                    href="tel:+917208903117"
                    className="text-forest font-medium hover:text-gold transition-colors"
                  >
                    +91 7208903117
                  </a>{" "}
                  with your order ID and we&apos;ll share the tracking details with you.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="text-center mb-12">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-3 text-[10px]">
              Journey
            </p>
            <h2 className="font-playfair text-forest font-bold text-3xl">
              Your Order Journey
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line connector */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gold/20 -translate-x-1/2" />
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-6">
              {TRACKING_STEPS.map((step, i) => (
                <div key={step.title} className="text-center relative">
                  <div className="w-14 h-14 bg-forest rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <step.icon size={22} className="text-gold" />
                  </div>
                  <h3 className="font-dm text-forest font-semibold text-sm mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-muted font-dm text-xs leading-relaxed">
                    {step.text}
                  </p>
                  {i < TRACKING_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[-50%] h-px bg-gold/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24">
          <div className="bg-forest text-white p-10 lg:p-14 text-center">
            <Clock size={28} className="text-gold mx-auto mb-4" />
            <h2 className="font-playfair font-bold text-2xl mb-4">
              Need Help With Your Order?
            </h2>
            <p className="text-white/70 font-dm text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              If you have any questions about your order status, delivery timeline, or
              need to make changes to your order, our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80 font-dm text-sm">
              <a href="mailto:mrudulavastra@gmail.com" className="hover:text-gold transition-colors">
                mrudulavastra@gmail.com
              </a>
              <span className="hidden sm:block text-white/30">|</span>
              <a href="tel:+917208903117" className="hover:text-gold transition-colors">
                +91 7208903117
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
