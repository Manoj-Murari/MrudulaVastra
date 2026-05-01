"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, CheckCircle, LogIn, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import Script from "next/script";
import { createRazorpayOrder, processOrderAfterPayment } from "@/actions/checkout";
import { getUserProfile } from "@/actions/profile";
import { validateCoupon, getActiveCouponsCount } from "@/actions/coupons";
import { checkIsLoggedIn } from "@/actions/auth";
import { getUserAddresses, saveAddressFromCheckout, type Address } from "@/actions/addresses";
import { getShippingSettings } from "@/actions/shipping";

/* ── Razorpay Types ──────────────────────────────────── */

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: RazorpayFailResponse) => void) => void;
    };
  }
}

export default function CartDrawer() {
  const { isCartOpen, toggleCart, items, cartTotal, removeFromCart, updateQuantity, resetCart, isHydrated } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "login">("cart");
  const [addressData, setAddressData] = useState({ fullName: "", phone: "", pincode: "", city: "", state: "", fullAddress: "" });
  const [hasProfileFetched, setHasProfileFetched] = useState(false);
  
  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [hasActiveCoupons, setHasActiveCoupons] = useState(false);

  // Shipping Settings State
  const [shippingSettings, setShippingSettings] = useState<{ shippingCharge: number; minFreeShippingOrderValue: number }>({
    shippingCharge: 100,
    minFreeShippingOrderValue: 2000,
  });

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getShippingSettings();
      if (settings) {
        setShippingSettings(settings);
      }
    }
    fetchSettings();
  }, []);

  const [showShippingInfo, setShowShippingInfo] = useState(false);

  // Address selection state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  useEffect(() => {
    async function preloadAddressData() {
      if (checkoutStep === "address" && !hasProfileFetched) {
        try {
          // Fetch saved addresses
          const addrs = await getUserAddresses();
          setSavedAddresses(addrs);

          if (addrs.length > 0) {
            // Auto-select default or first address
            const defaultAddr = addrs.find(a => a.is_default) || addrs[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressData({
              fullName: defaultAddr.full_name,
              phone: defaultAddr.phone,
              pincode: defaultAddr.pincode,
              city: defaultAddr.city,
              state: defaultAddr.state,
              fullAddress: defaultAddr.full_address,
            });
            setUseNewAddress(false);
          } else {
            // No saved addresses — fall back to profile
            setUseNewAddress(true);
            const profile = await getUserProfile();
            if (profile) {
              setAddressData(prev => ({
                ...prev,
                fullName: prev.fullName || profile.full_name || "",
                phone: prev.phone || profile.phone || "",
                pincode: prev.pincode || profile.pincode || "",
                city: prev.city || profile.city || "",
                state: prev.state || profile.state || "",
                fullAddress: prev.fullAddress || profile.full_address || ""
              }));
            }
          }
        } catch (e) {
          // silent fail
          setUseNewAddress(true);
        } finally {
          setHasProfileFetched(true);
        }
      }
    }
    preloadAddressData();
  }, [checkoutStep, hasProfileFetched]);

  // Check for active coupons
  useEffect(() => {
    async function checkCoupons() {
      const count = await getActiveCouponsCount();
      setHasActiveCoupons(count > 0);
    }
    checkCoupons();
  }, []);

  const handleCheckout = async () => {
    // Make sure they filled everything out
    if (!addressData.fullName || !addressData.phone || !addressData.pincode || !addressData.city || !addressData.state || !addressData.fullAddress) {
      alert("Please fill out all shipping details.");
      return;
    }

    setIsProcessing(true);
    
    // Format items
    const checkoutItems = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      name: item.product.name,
      variant: item.selectedSize ? `${item.product.color ? item.product.color + ' | ' : ''}${item.selectedSize}` : item.product.color,
    }));

    const isFreeShipping = cartTotal >= shippingSettings.minFreeShippingOrderValue;
    const shippingFee = isFreeShipping ? 0 : shippingSettings.shippingCharge;
    const finalAmountInRs = (appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal) + shippingFee;

    // Step 1: Initialize razorpay order from backend
    const orderResult = await createRazorpayOrder(finalAmountInRs);
    
    if (!orderResult.success) {
      alert("Failed to initialize checkout: " + orderResult.error);
      setIsProcessing(false);
      return;
    }

    // Step 2: Open Razorpay checkout modal
    const options = {
      key: orderResult.key,
      amount: orderResult.amount,
      currency: "INR",
      name: "Mrudula Vastra",
      description: "Secure Checkout",
      order_id: orderResult.orderId,
      handler: async function (response: RazorpaySuccessResponse) {
        // Step 3: Handle success, process order and save to DB
        const verifyResult = await processOrderAfterPayment(
          finalAmountInRs,
          checkoutItems,
          addressData,
          {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          }
        );

        setIsProcessing(false);

        if (verifyResult.success) {
          setSuccess(true);
          setOrderId(verifyResult.orderId || orderResult.orderId);
          resetCart();

          // Save address if user opted in
          if (saveNewAddress && useNewAddress) {
            saveAddressFromCheckout({
              label: "Home",
              fullName: addressData.fullName,
              phone: addressData.phone,
              fullAddress: addressData.fullAddress,
              city: addressData.city,
              state: addressData.state,
              pincode: addressData.pincode,
            }).catch(() => {}); // silent — don't block success
          }
        } else {
          alert("Order processing failed: " + verifyResult.message);
        }
      },
      prefill: {
        name: addressData.fullName,
        contact: addressData.phone,
      },
      theme: {
        color: "#183226" // Forest
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    // Calculate final amount for Razorpay (In Paise)
    options.amount = finalAmountInRs * 100;

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response: RazorpayFailResponse) {
       alert("Payment Failed: " + response.error.description);
       setIsProcessing(false);
    });

    rzp.open();
  };

  const closeDrawer = () => {
    toggleCart(false);
    // Give time for layout to slide out before resetting states
    setTimeout(() => {
      setSuccess(false);
      setCheckoutStep("cart");
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponError("");
    }, 500); 
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-cream shadow-2xl z-[101] flex flex-col border-l-2 border-gold/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/20">
              <h2 className="font-playfair text-forest text-2xl font-normal flex items-center gap-2">
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

            {/* Content Body — Fixed scrolling for multiple items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:max-h-[calc(100vh-320px)]">
              {success ? (
                /* Success State */
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <CheckCircle size={64} className="text-forest mb-2" />
                  <h3 className="font-playfair text-2xl font-normal text-forest">Order Confirmed!</h3>
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
                /* Address Step */
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setCheckoutStep("cart")} className="text-text-muted hover:text-forest text-sm font-dm transition-colors">
                      &larr; Back to Cart
                    </button>
                  </div>
                  <h3 className="font-playfair text-2xl font-normal text-forest">Shipping Details</h3>

                  {/* Saved Address Picker */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted font-dm">Saved Addresses</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {savedAddresses.map(addr => (
                          <label
                            key={addr.id}
                            className={`block p-3 border cursor-pointer transition-all ${
                              selectedAddressId === addr.id && !useNewAddress
                                ? "border-forest bg-forest/[0.03]"
                                : "border-gold/15 hover:border-gold/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddr"
                              className="sr-only"
                              checked={selectedAddressId === addr.id && !useNewAddress}
                              onChange={() => {
                                setSelectedAddressId(addr.id);
                                setUseNewAddress(false);
                                setAddressData({
                                  fullName: addr.full_name,
                                  phone: addr.phone,
                                  pincode: addr.pincode,
                                  city: addr.city,
                                  state: addr.state,
                                  fullAddress: addr.full_address,
                                });
                              }}
                            />
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-dm">{addr.label}</span>
                              {addr.is_default && <span className="text-[8px] bg-forest text-white px-1.5 py-0.5 uppercase tracking-wider font-bold">Default</span>}
                            </div>
                            <p className="text-xs font-dm text-text-muted truncate">{addr.full_name} • {addr.full_address}</p>
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUseNewAddress(true);
                          setSelectedAddressId(null);
                          setAddressData({ fullName: "", phone: "", pincode: "", city: "", state: "", fullAddress: "" });
                        }}
                        className={`w-full py-2.5 text-xs font-dm uppercase tracking-wider font-bold border-2 border-dashed transition-all ${
                          useNewAddress ? "border-forest text-forest bg-forest/[0.03]" : "border-gold/20 text-text-muted hover:border-forest/30"
                        }`}
                      >
                        + Use a Different Address
                      </button>
                    </div>
                  )}

                  {/* Manual Address Form (shown when no saved addresses or "Use a Different Address" is selected) */}
                  {(useNewAddress || savedAddresses.length === 0) && (
                    <div className="space-y-4">
                      {savedAddresses.length > 0 && <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted font-dm">New Address</p>}
                      <input type="text" placeholder="Full Name" value={addressData.fullName} onChange={e => setAddressData({...addressData, fullName: e.target.value.replace(/[^A-Za-z\s]/g, '')})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                      <input type="tel" placeholder="WhatsApp Number" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value.replace(/\D/g, '').slice(0, 15)})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <select required value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors border-0">
                          <option value="" disabled>Select State</option>
                          {[
                            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
                            "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
                            "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
                            "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                          ].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="text" placeholder="City" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value.replace(/[^A-Za-z\s]/g, '')})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                      </div>

                      <input type="text" placeholder="Pincode" value={addressData.pincode} onChange={e => setAddressData({...addressData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors" />
                      <textarea placeholder="House No, Building, Street Area" value={addressData.fullAddress} onChange={e => setAddressData({...addressData, fullAddress: e.target.value})} rows={3} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/50 font-dm transition-colors resize-none" />

                      {/* Save this address checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          className="accent-forest w-4 h-4"
                        />
                        <span className="text-xs font-dm text-text-muted">Save this address for future orders</span>
                      </label>
                    </div>
                  )}
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
                          sizes="100px"
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                          {item.product.category}
                        </p>
                        <h4 className="font-cormorant text-forest font-medium text-xl leading-tight line-clamp-2">
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
                
                {/* Coupon Code Section */}
                {hasActiveCoupons && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] uppercase tracking-widest font-bold text-text-muted">Apply Coupon</span>
                      {appliedCoupon && (
                        <button 
                          onClick={() => { setAppliedCoupon(null); setCouponError(""); }}
                          className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                          placeholder="Enter Code (e.g. MRUDULA10)"
                          className="flex-1 bg-sand/50 border border-gold/20 rounded px-3 py-2 text-sm font-dm focus:outline-none focus:border-forest transition-colors"
                        />
                        <button 
                          disabled={!couponInput || isApplyingCoupon}
                          onClick={async () => {
                            setIsApplyingCoupon(true);
                            const res = await validateCoupon(couponInput, cartTotal);
                            if (res.success && res.discountAmount) {
                              setAppliedCoupon({ code: res.code!, discountAmount: res.discountAmount });
                              setCouponError("");
                              setCouponInput("");
                            } else {
                              setCouponError(res.message);
                            }
                            setIsApplyingCoupon(false);
                          }}
                          className="px-4 py-2 bg-forest text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-forest/90 transition-colors disabled:opacity-50"
                        >
                          {isApplyingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 rounded px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">{appliedCoupon.code} Applied</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">- ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    
                    {couponError && <p className="text-[10px] text-red-500 mt-1.5 font-medium">{couponError}</p>}
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-sm text-text-muted">
                    <span>Bag Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm text-emerald-600 font-medium">
                      <span>Coupon Discount</span>
                      <span>- ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="relative">
                    <div className="flex justify-between items-center text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        Shipping & Handling
                        <button
                          type="button"
                          onClick={() => setShowShippingInfo(!showShippingInfo)}
                          className="hover:text-forest transition-colors duration-200"
                          title="View delivery details"
                        >
                          <HelpCircle size={14} className="text-forest/70 hover:text-forest transition-colors" />
                        </button>
                      </span>
                      {cartTotal >= shippingSettings.minFreeShippingOrderValue ? (
                        <span className="text-emerald-600 font-medium">FREE</span>
                      ) : (
                        <span>₹{shippingSettings.shippingCharge.toLocaleString("en-IN")}</span>
                      )}
                    </div>

                    <AnimatePresence>
                      {showShippingInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -5 }}
                          className="mt-2 p-3 bg-forest/5 border border-forest/10 rounded-lg text-xs leading-relaxed font-dm text-text-muted"
                        >
                          <p className="font-medium text-forest mb-1">Standard Delivery</p>
                          <p>
                            A delivery charge of <span className="font-semibold">₹{shippingSettings.shippingCharge}</span> applies for orders below <span className="font-semibold">₹{shippingSettings.minFreeShippingOrderValue}</span>.
                          </p>
                          <p className="mt-1">
                            Enjoy <span className="text-emerald-600 font-medium">Free Delivery</span> on orders of <span className="font-semibold">₹{shippingSettings.minFreeShippingOrderValue}</span> or more.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-gold/10">
                    <span className="text-text-primary font-bold tracking-wide">Final Total</span>
                    <span className="font-playfair text-forest font-bold text-2xl">
                      ₹{(
                        (appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal) +
                        (cartTotal >= shippingSettings.minFreeShippingOrderValue ? 0 : shippingSettings.shippingCharge)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center justify-between text-xs font-dm">
                    <span className="text-text-muted">Expected Delivery</span>
                    <span className="font-semibold text-forest">Within 3 - 7 business days</span>
                  </div>
                </div>
                
                {checkoutStep === "login" ? (
                  /* Login Gate */
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <LogIn size={20} className="text-forest" />
                      <p className="font-playfair text-forest text-lg font-medium">Sign in to continue</p>
                    </div>
                    <p className="text-text-muted font-dm text-xs">
                      Please login or create an account to place your order.
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => toggleCart(false)}
                      className="block w-full py-4 uppercase bg-forest text-white tracking-[0.15em] text-sm font-bold hover:bg-forest/90 transition-all text-center"
                    >
                      Login / Sign Up
                    </Link>
                    <button
                      onClick={() => setCheckoutStep("cart")}
                      className="text-[10px] text-text-muted hover:text-forest font-dm uppercase tracking-widest transition-colors underline underline-offset-4"
                    >
                      ← Back to Cart
                    </button>
                  </div>
                ) : checkoutStep === "cart" ? (
                  <button
                    onClick={async () => {
                      const loggedIn = await checkIsLoggedIn();
                      setCheckoutStep(loggedIn ? "address" : "login");
                    }}
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
                
                {/* Removed Shipping & Taxes message */}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
