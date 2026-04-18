"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { processMockCheckout } from "@/actions/checkout";
import { getUserProfile } from "@/actions/profile";

export default function CartDrawer() {
  const { isCartOpen, toggleCart, items, cartTotal, removeFromCart, updateQuantity, resetCart, isHydrated } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address">("cart");
  const [addressData, setAddressData] = useState({ fullName: "", phone: "", pincode: "", fullAddress: "" });
  const [hasProfileFetched, setHasProfileFetched] = useState(false);

  useEffect(() => {
    async function preloadProfile() {
      if (checkoutStep === "address" && !hasProfileFetched) {
        try {
          const profile = await getUserProfile();
          if (profile) {
            setAddressData(prev => ({
              fullName: prev.fullName || profile.full_name || "",
              phone: prev.phone || profile.phone || "",
              pincode: prev.pincode || profile.pincode || "",
              fullAddress: prev.fullAddress || profile.full_address || ""
            }));
          }
        } catch (e) {
          // silent fail
        } finally {
          setHasProfileFetched(true);
        }
      }
    }
    preloadProfile();
  }, [checkoutStep, hasProfileFetched]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Format items for the mock checkout API
    const checkoutItems = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      name: item.product.name,
      variant: item.selectedSize ? `${item.product.color ? item.product.color + ' | ' : ''}${item.selectedSize}` : item.product.color,
    }));

    const result = await processMockCheckout(cartTotal, checkoutItems, addressData);

    setIsProcessing(false);

    if (result.success) {
      setSuccess(true);
      setOrderId(result.orderId || "MOCK-" + Math.random().toString(36).substring(2, 9).toUpperCase());
      resetCart();
    } else {
      alert("Checkout failed: " + result.message);
    }
  };

  const closeDrawer = () => {
    toggleCart(false);
    // Give time for layout to slide out before resetting states
    setTimeout(() => {
      setSuccess(false);
      setCheckoutStep("cart");
    }, 500); 
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-cream shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/20">
              <h2 className="font-playfair text-forest text-2xl font-bold flex items-center gap-2">
                <ShoppingBag size={22} />
                Your Cart
              </h2>
              <button
                onClick={closeDrawer}
                className="text-text-muted hover:text-red-500 transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              {success ? (
                /* Success State */
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <CheckCircle size={64} className="text-forest mb-2" />
                  <h3 className="font-playfair text-2xl font-bold text-forest">Order Confirmed!</h3>
                  <p className="text-text-muted text-sm">
                    Thank you for shopping with Mrudula Vastra. Your payment was securely processed.
                  </p>
                  <div className="bg-white px-4 py-3 rounded border border-gold/20 shadow-sm w-full mt-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono font-bold text-forest">{orderId}</p>
                  </div>
                  <p className="text-xs text-gold font-medium mt-4">
                    A confirmation email has been sent to your registered address.
                  </p>
                  <button
                    onClick={closeDrawer}
                    className="mt-8 w-full py-4 bg-forest text-white uppercase tracking-wider text-sm font-bold hover:bg-forest/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : checkoutStep === "address" ? (
                /* Address Form */
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setCheckoutStep("cart")} className="text-text-muted hover:text-forest text-sm font-dm transition-colors">
                      &larr; Back to Cart
                    </button>
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-forest">Shipping Details</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Full Name" value={addressData.fullName} onChange={e => setAddressData({...addressData, fullName: e.target.value})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                    <input type="text" placeholder="WhatsApp Number" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                    <input type="text" placeholder="Pincode" value={addressData.pincode} onChange={e => setAddressData({...addressData, pincode: e.target.value})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                    <textarea placeholder="Full Address" value={addressData.fullAddress} onChange={e => setAddressData({...addressData, fullAddress: e.target.value})} rows={3} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors resize-none" />
                  </div>
                </motion.div>
              ) : items.length === 0 ? (
                /* Empty Cart State */
                <div className="flex flex-col items-center justify-center h-full opacity-60">
                  <ShoppingBag size={48} strokeWidth={1} className="text-gold mb-4" />
                  <p className="font-medium text-text-primary text-lg">Your bag is empty.</p>
                  <p className="text-sm text-text-muted mt-2">Time to fill it with elegance.</p>
                </div>
              ) : (
                /* Active Cart Items */
                <div className="flex flex-col gap-6">
                  {isHydrated && items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 items-start">
                      {/* Product Image */}
                      <div className="relative w-24 h-32 bg-white flex-shrink-0 border border-gold/10">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                          {item.product.category}
                        </p>
                        <h4 className="font-playfair text-forest font-semibold text-lg leading-tight truncate">
                          {item.product.name}
                        </h4>
                        
                        {/* Variant Info */}
                        {(item.selectedSize || item.product.color) && (
                          <p className="text-[11px] font-dm text-text-muted mt-0.5">
                            {item.product.color ? `Color: ${item.product.color}` : ""}
                            {item.product.color && item.selectedSize ? " | " : ""}
                            {item.selectedSize ? `Size: ${item.selectedSize}` : ""}
                          </p>
                        )}

                        <div className="text-forest font-semibold mt-1">
                          ₹{item.product.price.toLocaleString("en-IN")}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gold/30 rounded-full overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="px-3 py-1 bg-white hover:bg-gold/10 text-forest font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="px-3 py-1 bg-white hover:bg-gold/10 text-forest font-bold"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-text-muted hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout Button */}
            {!success && items.length > 0 && (
              <div className="p-6 border-t border-gold/20 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-text-primary font-medium tracking-wide">Subtotal</span>
                  <span className="font-playfair text-forest font-bold text-2xl">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                
                {checkoutStep === "cart" ? (
                  <button
                    onClick={() => setCheckoutStep("address")}
                    className="w-full py-4 uppercase bg-forest text-white tracking-[0.15em] text-sm font-bold hover:bg-forest/90 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || !addressData.fullName || !addressData.phone || !addressData.fullAddress || !addressData.pincode}
                    className="w-full py-4 uppercase bg-forest text-white tracking-[0.15em] text-sm font-bold hover:bg-forest/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Secure Order"
                    )}
                  </button>
                )}
                
                <p className="text-center text-[10px] text-text-muted uppercase mt-3 tracking-widest">
                  Shipping & Taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
