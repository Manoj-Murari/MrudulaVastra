"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const FAQ_CATEGORIES = [
  {
    category: "Orders & Payment",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and Cash on Delivery (COD). All online payments are processed securely through Razorpay.",
      },
      {
        q: "How do I place an order?",
        a: "Browse our collections, select the product you love, and click 'Add to Cart'. Once you're ready, proceed to checkout, enter your shipping details, and complete the payment. You'll receive an order confirmation via email and SMS.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 12 hours of placing them, provided they haven't been dispatched. Contact us at mrudulavastra@gmail.com or call +91 7208903117 to cancel your order.",
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "Yes, COD is available for orders within India. An additional handling fee of ₹49 applies for COD orders. COD is available for orders up to ₹10,000.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    faqs: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5–7 business days for metro cities and 7–10 business days for other locations. Processing time is 1–2 business days before dispatch.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free shipping on all prepaid orders above ₹1,999. For orders below ₹1,999, a flat shipping fee of ₹99 is applicable.",
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is shipped, you'll receive a tracking link via email and SMS. You can also visit our 'Track Your Order' page with your order ID.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, we only ship within India. We're working on expanding to international destinations. Follow us on Instagram for updates!",
      },
    ],
  },
  {
    category: "Products & Quality",
    faqs: [
      {
        q: "Are your products authentic handloom?",
        a: "Yes, we source directly from master weavers and verified handloom clusters across India. Each product is handpicked by our team to ensure authenticity and quality.",
      },
      {
        q: "Will the colors look the same as on the website?",
        a: "We make every effort to display colors as accurately as possible. However, slight variations may occur due to screen settings and lighting conditions during photography. The actual product will be equally beautiful!",
      },
      {
        q: "How should I care for my sarees and ethnic wear?",
        a: "We recommend dry cleaning for silk sarees and delicate fabrics. Cotton and cotton-blend fabrics can be hand-washed with a mild detergent. Always store sarees in cotton or muslin cloth to preserve their luster.",
      },
      {
        q: "Do you sell stitched or unstitched products?",
        a: "We sell both! Sarees come ready to drape, dress materials are unstitched (top, bottom & dupatta), and kids wear comes in stitched, ready-to-wear form. Check individual product listings for specifics.",
      },
    ],
  },
  {
    category: "Returns & Exchange",
    faqs: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return window from the date of delivery. Products must be unused, unwashed, with original tags and packaging intact. Visit our Returns & Exchange page for full details.",
      },
      {
        q: "How long does a refund take?",
        a: "Once the returned product passes quality inspection (2–3 business days), your refund will be processed within 5–7 business days to the original payment method.",
      },
      {
        q: "Can I exchange a product?",
        a: "Yes, exchanges are available for different sizes or colors (subject to availability). Contact our customer care team to initiate an exchange within 7 days of delivery.",
      },
    ],
  },
  {
    category: "Account & General",
    faqs: [
      {
        q: "Do I need an account to place an order?",
        a: "While you can browse our collections without an account, creating one helps you track orders, save favorites, and enjoy a faster checkout experience.",
      },
      {
        q: "How can I contact customer support?",
        a: "You can reach us via email at mrudulavastra@gmail.com or call us at +91 7208903117. Our team is available Monday to Saturday, 10 AM to 7 PM IST.",
      },
      {
        q: "Do you have a physical store?",
        a: "We operate primarily online to offer the best prices. However, we're based in Machilipatnam, Andhra Pradesh, and you can contact us for personalized video consultations.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gold/10 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 lg:p-6 text-left group"
      >
        <span className="font-dm text-forest font-medium text-sm pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gold flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-5 lg:px-6 pb-5 lg:pb-6 text-text-muted font-dm text-sm leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen bg-cream">
        <Breadcrumb items={[{ label: "FAQ" }]} />

        {/* Hero */}
        <section className="relative py-20 lg:py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <p
              className="uppercase text-gold font-dm font-medium tracking-[0.35em] mb-4"
              style={{ fontSize: "11px" }}
            >
              FAQ
            </p>
            <h1 className="font-playfair text-forest font-bold text-4xl lg:text-5xl mb-6">
              Frequently Asked
              <br />
              Questions
            </h1>
            <p className="text-text-muted font-dm text-lg max-w-xl mx-auto leading-relaxed">
              Find answers to common questions about our products, shipping, returns,
              and more.
            </p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-16">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle size={20} className="text-gold" />
                <h2 className="font-playfair text-forest font-bold text-xl">
                  {cat.category}
                </h2>
              </div>
              <div className="space-y-3">
                {cat.faqs.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Still Have Questions */}
        <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-24">
          <div className="bg-forest text-white p-10 lg:p-14 text-center">
            <h2 className="font-playfair font-bold text-2xl mb-4">
              Still Have Questions?
            </h2>
            <p className="text-white/70 font-dm text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              Can&apos;t find what you&apos;re looking for? Our customer care team is
              happy to help with any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80 font-dm text-sm">
              <a
                href="mailto:mrudulavastra@gmail.com"
                className="hover:text-gold transition-colors"
              >
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
