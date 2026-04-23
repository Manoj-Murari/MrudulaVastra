"use client";

import { useState } from "react";
import { submitEnquiry } from "@/app/actions/enquiry";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitEnquiry(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-forest/5 border border-forest/20 p-8 text-center h-full flex flex-col justify-center">
        <h3 className="font-playfair text-2xl text-forest mb-4">Message Received</h3>
        <p className="text-forest/80 font-dm text-sm leading-relaxed mb-6">
          Thank you for reaching out to Mrudula Vastra. Our team will review your inquiry and get back to you shortly.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="text-xs uppercase tracking-widest text-gold hover:text-forest transition-colors font-bold"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 border border-red-100">
          {error}
        </div>
      )}
      <div>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Full Name *"
          className="w-full py-3 bg-transparent border-b border-gold/30 focus:border-forest focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/60"
        />
      </div>

      <div>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email Address *"
          className="w-full py-3 bg-transparent border-b border-gold/30 focus:border-forest focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/60"
        />
      </div>

      <div>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="Subject"
          className="w-full py-3 bg-transparent border-b border-gold/30 focus:border-forest focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/60"
        />
      </div>

      <div>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Your Message *"
          className="w-full py-3 bg-transparent border-b border-gold/30 focus:border-forest focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/60 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-8 py-4 bg-forest text-white uppercase tracking-[0.15em] text-xs font-bold font-dm hover:bg-forest/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
