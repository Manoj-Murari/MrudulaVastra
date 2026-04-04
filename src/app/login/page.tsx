"use client";

import { useState } from "react";
import Link from "next/link";
import { loginWithEmail, signupWithEmail } from "@/actions/auth";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = isSignUp
      ? await signupWithEmail(formData)
      : await loginWithEmail(formData);

    setLoading(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
    }
    if (result && "success" in result && result.success) {
      setSuccess(result.success);
    }
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
            {isSignUp
              ? "Create an account to track your orders"
              : "Sign in to your account"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gold/10 p-8 lg:p-10">
          <h2 className="font-playfair text-forest font-bold text-2xl mb-8 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 font-dm text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-dm text-sm">
              {success}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
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
                minLength={6}
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
                  {isSignUp ? "Creating Account..." : "Signing In..."}
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
              {isSignUp ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-forest font-semibold hover:text-gold transition-colors underline underline-offset-2"
              >
                {isSignUp ? "Sign In" : "Create One"}
              </button>
            </p>
          </div>
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
