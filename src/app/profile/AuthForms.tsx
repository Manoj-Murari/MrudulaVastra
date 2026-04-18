"use client";

import { useState } from "react";
import { loginWithEmail, signupWithEmail, verifySignupOtp } from "@/actions/auth";

export default function AuthForms() {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    setError("");
    const result = await loginWithEmail(formData);
    if (result && result.error) setError(result.error);
    setIsLoading(false);
  }

  async function handleSignup(formData: FormData) {
    setIsLoading(true);
    setError("");
    setMessage("");
    const result = await signupWithEmail(formData);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.success) {
      setMessage(result.success);
      setMode("verify");
    }
    setIsLoading(false);
  }

  async function handleVerify(formData: FormData) {
    setIsLoading(true);
    setError("");
    const result = await verifySignupOtp(formData);
    if (result && result.error) setError(result.error);
    setIsLoading(false);
  }

  return (
    <div className="max-w-md mx-auto w-full bg-white p-8 border border-gold/20 shadow-2xl">
      <h2 className="font-playfair text-3xl text-forest font-bold mb-2">
        {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Verify Email"}
      </h2>
      <p className="text-text-muted font-dm text-sm mb-8">
        {mode === "login" 
          ? "Login to access your orders and saved details." 
          : mode === "signup" 
          ? "Sign up to track orders and save your shipping details safely."
          : "We sent a 6-digit code to your email."}
      </p>

      {error && <p className="text-red-500 font-dm text-sm mb-4 bg-red-50 p-3">{error}</p>}
      {message && <p className="text-forest font-dm text-sm mb-4 bg-emerald-50 p-3">{message}</p>}

      {mode === "login" && (
        <form action={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Password</label>
            <input type="password" name="password" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
            {isLoading ? "Loading..." : "Secure Login"}
          </button>
          <div className="text-center mt-6">
            <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-sm font-dm text-text-muted hover:text-gold transition-colors">
              Don't have an account? <span className="font-bold underline underline-offset-4">Sign up</span>
            </button>
          </div>
        </form>
      )}

      {mode === "signup" && (
        <form action={handleSignup} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Full Name</label>
            <input type="text" name="fullName" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Password</label>
            <input type="password" name="password" required minLength={8} className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
            {isLoading ? "Creating..." : "Create Account"}
          </button>
          <div className="text-center mt-6">
            <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-sm font-dm text-text-muted hover:text-gold transition-colors">
              Already have an account? <span className="font-bold underline underline-offset-4">Log in</span>
            </button>
          </div>
        </form>
      )}

      {mode === "verify" && (
        <form action={handleVerify} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">6-Digit Code</label>
            <input type="text" name="otp" required className="w-full bg-transparent border-b border-gold/30 py-2 inset-shadow-xs focus:outline-none focus:border-forest text-forest tracking-[0.2em] font-mono transition-colors" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
            {isLoading ? "Verifying..." : "Verify & Enter"}
          </button>
        </form>
      )}
    </div>
  );
}
