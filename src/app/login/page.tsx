"use client";

import { useState } from "react";
import Link from "next/link";
import { loginWithEmail, signupWithEmail, verifySignupOtp } from "@/actions/auth";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const email = formData.get("email") as string;
    setSavedEmail(email);

    const result = isSignUp
      ? await signupWithEmail(formData)
      : await loginWithEmail(formData);

    setLoading(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
    }
    if (result && "success" in result && result.success) {
      // Show the OTP screen instead of the old success message
      setShowOtpInput(true);
    }
  }

  async function handleVerifyOtp(formData: FormData) {
    setError(null);
    setLoading(true);

    // We append the email saved from the first step so Supabase knows who is verifying
    formData.append("email", savedEmail);

    const result = await verifySignupOtp(formData);

    setLoading(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
    }
    // Note: On success, verifySignupOtp automatically redirects to /profile
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1
              className="font-playfair text-forest font-bold inline-block"
              style={{ fontSize: "28px", letterSpacing: "0.08em" }}
            >
              MRUDULA VASTRA
            </h1>
          </Link>
          <p className="text-text-muted font-dm text-sm mt-3">
            {showOtpInput
              ? "Verify your email address"
              : isSignUp
                ? "Create an account to track your orders"
                : "Sign in to your account"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gold/10 p-8 lg:p-10">
          <h2 className="font-playfair text-forest font-bold text-2xl mb-8 text-center">
            {showOtpInput
              ? "Enter Code"
              : isSignUp
                ? "Create Account"
                : "Welcome Back"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 font-dm text-sm">
              {error}
            </div>
          )}

          {showOtpInput ? (
            <div className="text-center">
              <p className="text-text-muted font-dm text-sm leading-relaxed mb-6">
                We sent a 6-digit code to <br />
                <span className="font-bold text-forest">{savedEmail}</span>
              </p>

              <form action={handleVerifyOtp} className="space-y-6">
                <div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    required
                    placeholder="000000"
                    className="w-full px-4 py-4 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-3xl tracking-[0.5em] text-center text-forest placeholder:text-text-muted/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-forest/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setShowOtpInput(false);
                  setIsSignUp(false);
                }}
                className="mt-6 text-text-muted font-dm text-sm hover:text-forest transition-colors underline underline-offset-2"
              >
                Cancel and return to login
              </button>
            </div>
          ) : (
            <>
              <form action={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div>
                    <label
                      htmlFor="login-name"
                      className="block text-forest font-dm font-medium text-sm mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="login-name"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-forest font-dm font-medium text-sm mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-forest font-dm font-medium text-sm mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-forest/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isSignUp ? "Sending Code..." : "Signing In..."}
                    </>
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Toggle */}
              <div className="mt-8 text-center">
                <p className="text-text-muted font-dm text-sm">
                  {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-forest font-semibold hover:text-gold transition-colors underline underline-offset-2"
                  >
                    {isSignUp ? "Sign In" : "Create One"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-text-muted font-dm text-sm hover:text-forest transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}