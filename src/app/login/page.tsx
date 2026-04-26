"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginWithEmail, signupWithEmail, signupWithOtpOnly, verifySignupOtp, sendLoginOtp, verifyLoginOtp, resendOtp } from "@/actions/auth";

function LoginContent() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams?.get("view") === "signup");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("otp");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams?.get("view") === "signup") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const email = formData.get("email") as string;
    setSavedEmail(email);

    let result;
    if (isSignUp) {
      const password = formData.get("password")?.toString() || "";
      result = password && password.length >= 8
        ? await signupWithEmail(formData)
        : await signupWithOtpOnly(formData);
    } else if (loginMethod === "otp") {
      result = await sendLoginOtp(formData);
    } else {
      result = await loginWithEmail(formData);
    }

    setLoading(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
    }
    if (result && "success" in result && result.success) {
      setShowOtpInput(true);
      setResendCooldown(60);
    }
  }

  async function handleVerifyOtp(formData: FormData) {
    setError(null);
    setLoading(true);

    formData.append("email", savedEmail);

    const result = isSignUp 
      ? await verifySignupOtp(formData)
      : await verifyLoginOtp(formData);

    setLoading(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
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
                className="mt-4 text-text-muted font-dm text-sm hover:text-forest transition-colors underline underline-offset-2"
              >
                Cancel and return to login
              </button>

              {/* Resend OTP */}
              <div className="mt-4">
                {resendMessage && (
                  <p className="text-forest font-dm text-xs mb-2 bg-emerald-50 p-2 border border-emerald-200">
                    {resendMessage}
                  </p>
                )}
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={async () => {
                    setResendMessage(null);
                    setError(null);
                    const result = await resendOtp(savedEmail, isSignUp ? 'signup' : 'login');
                    if (result.error) {
                      setError(result.error);
                    } else if (result.success) {
                      setResendMessage(result.success);
                      setResendCooldown(60);
                    }
                  }}
                  className="text-text-muted font-dm text-sm hover:text-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive the code? Resend"}
                </button>
              </div>
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

                {!isSignUp && loginMethod === "otp" && (
                  <div className="text-center py-2">
                    <p className="text-[12px] text-text-muted font-dm mb-4">
                      We'll send a secure 6-digit code to your email.
                    </p>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("password")}
                      className="text-[11px] text-forest/60 hover:text-forest font-dm uppercase tracking-wider transition-colors underline underline-offset-4"
                    >
                      Sign in with password instead
                    </button>
                  </div>
                )}

                {!isSignUp && loginMethod === "password" && (
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
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setLoginMethod("otp")}
                        className="text-[11px] text-forest/60 hover:text-forest font-dm uppercase tracking-wider transition-colors underline underline-offset-4"
                      >
                        Sign in with OTP code instead
                      </button>
                    </div>
                  </div>
                )}

                {isSignUp && (
                  <div>
                    {showPassword ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor="login-password" className="block text-forest font-dm font-medium text-sm">Password (Optional)</label>
                          <button type="button" onClick={() => setShowPassword(false)} className="text-[9px] text-red-400 hover:text-red-500 font-dm uppercase tracking-widest transition-colors">Remove</button>
                        </div>
                        <input id="login-password" name="password" type="password" minLength={8} placeholder="Min 8 characters" className="w-full px-4 py-3 bg-cream border border-gold/15 focus:border-gold/40 focus:outline-none transition-colors font-dm text-sm text-forest placeholder:text-text-muted/50" />
                        <p className="text-[10px] text-text-muted/60 font-dm mt-1 italic">You can also log in with OTP anytime.</p>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowPassword(true)} className="text-[11px] text-forest/60 hover:text-forest font-dm uppercase tracking-wider transition-colors underline underline-offset-4">
                        + Add a password (optional)
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-forest/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isSignUp ? "Sending Code..." : loginMethod === "otp" ? "Sending OTP..." : "Signing In..."}
                    </>
                  ) : isSignUp ? (
                    "Create Account"
                  ) : loginMethod === "otp" ? (
                    "Send Login Code"
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-forest/30 border-t-forest rounded-full animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}