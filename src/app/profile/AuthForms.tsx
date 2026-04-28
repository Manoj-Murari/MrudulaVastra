"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, signupWithEmail, signupWithOtpOnly, verifySignupOtp, sendLoginOtp, verifyLoginOtp, resendOtp } from "@/actions/auth";

export default function AuthForms() {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("otp"); // OTP is now primary
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For optional password in signup
  const [verifyContext, setVerifyContext] = useState<"signup" | "login">("login");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const [isRedirectedNewUser, setIsRedirectedNewUser] = useState(false);
  const router = useRouter();

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    setError("");
    setMessage("");
    
    const email = formData.get("email")?.toString() || "";
    setEmailForVerification(email);

    const result = loginMethod === "password" 
      ? await loginWithEmail(formData)
      : await sendLoginOtp(formData);

    if (result && (result as any).reason === "user_not_found") {
      setMode("signup");
      setIsRedirectedNewUser(true);
    } else if (result && result.error) {
      setError(result.error);
    } else if (result && (result as any).success) {
      if ((result as any).success === true) {
        router.push("/profile");
      } else {
        setMessage((result as any).success);
        setVerifyContext("login");
        setMode("verify");
        setResendCooldown(10);
      }
    }
    setIsLoading(false);
  }

  async function handleSignup(formData: FormData) {
    setIsLoading(true);
    setError("");
    setMessage("");

    const password = formData.get("password")?.toString() || "";

    // If password is provided and meets minimum length, use password signup
    // Otherwise, use OTP-only signup
    const result = password && password.length >= 8
      ? await signupWithEmail(formData)
      : await signupWithOtpOnly(formData);

    if (result && result.error) {
      setError(result.error);
    } else if (result && result.success) {
      setEmailForVerification(formData.get("email")?.toString() || "");
      setMessage(result.success);
      setVerifyContext("signup");
      setMode("verify");
      setResendCooldown(10);
    }
    setIsLoading(false);
  }

  async function handleVerify(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    formData.append("email", emailForVerification);

    const result = verifyContext === "login"
      ? await verifyLoginOtp(formData)
      : await verifySignupOtp(formData);

    if (result && result.error) {
      setError(result.error);
    } else if (result && result.success === true) {
      router.push("/profile");
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-md mx-auto w-full bg-white p-8 border border-gold/20 shadow-2xl">
      <h2 className="font-playfair text-3xl text-forest font-bold mb-2">
        {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Verify Email"}
      </h2>
      <p className="text-text-muted font-dm text-sm mb-8">
        {mode === "login" 
          ? "Enter your email and we'll send a secure login code." 
          : mode === "signup" 
          ? "Sign up to track orders and save your shipping details."
          : `We sent a 6-digit code to ${emailForVerification}`}
      </p>

      {error && <p className="text-red-500 font-dm text-sm mb-4 bg-red-50 p-3">{error}</p>}
      {message && <p className="text-forest font-dm text-sm mb-4 bg-emerald-50 p-3">{message}</p>}

      {/* ── LOGIN FORM ─────────────────────────── */}
      {mode === "login" && (
        <form action={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          
          {loginMethod === "otp" ? (
            /* OTP Mode (Primary) */
            <div className="py-2">
              <p className="text-[11px] text-text-muted font-dm italic">
                We'll send a secure 6-digit code to your email.
              </p>
            </div>
          ) : (
            /* Password Mode (Secondary) */
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Password</label>
              <input type="password" name="password" required className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
            {isLoading ? "Loading..." : loginMethod === "otp" ? "Send Login Code" : "Secure Login"}
          </button>

          {/* Toggle login method */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setLoginMethod(loginMethod === "otp" ? "password" : "otp")}
              className="text-[10px] text-forest/50 hover:text-forest font-dm uppercase tracking-widest transition-colors underline underline-offset-4"
            >
              {loginMethod === "otp" ? "Sign in with password instead" : "Sign in with OTP code instead"}
            </button>
          </div>

          <div className="text-center mt-4">
            <button type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="text-sm font-dm text-text-muted hover:text-gold transition-colors">
              Don't have an account? <span className="font-bold underline underline-offset-4">Sign up</span>
            </button>
          </div>
        </form>
      )}

      {/* ── SIGNUP FORM ────────────────────────── */}
      {mode === "signup" && (
        <form action={handleSignup} className="space-y-5">
          {/* Onboarding Banner */}
          {isRedirectedNewUser && (
            <div className="mb-4 p-4 bg-[#F9F6E8] border border-gold/40 text-[#5C4D1D] font-dm text-sm leading-relaxed">
              <strong>Welcome!</strong> It looks like you're new here. Please provide your Name and Phone number to create your Mrudula Vastra account.
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Full Name</label>
            <input type="text" name="fullName" required pattern="^[A-Za-z\s]+$" title="Names should only contain letters and spaces" className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Email Address</label>
            <input type="email" name="email" required defaultValue={emailForVerification} readOnly={isRedirectedNewUser} className={`w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors ${isRedirectedNewUser ? "opacity-60 cursor-not-allowed" : ""}`} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">Phone Number</label>
            <input type="tel" name="phone" required pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest font-dm transition-colors" />
          </div>

          {/* Optional Password Toggle */}
          {showPassword ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm">Password (Optional)</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(false)}
                  className="text-[9px] text-red-400 hover:text-red-500 font-dm uppercase tracking-widest transition-colors"
                >
                  Remove
                </button>
              </div>
              <input type="password" name="password" minLength={8} placeholder="Min 8 characters" className="w-full bg-transparent border-b border-gold/30 py-2 focus:outline-none focus:border-forest text-forest placeholder:text-text-muted/40 font-dm transition-colors" />
              <p className="text-[10px] text-text-muted/60 font-dm mt-1 italic">You can also log in with OTP anytime.</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="text-[10px] text-forest/50 hover:text-forest font-dm uppercase tracking-widest transition-colors underline underline-offset-4"
            >
              + Add a password (optional)
            </button>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
            {isLoading ? "Creating..." : "Create Account"}
          </button>
          <div className="text-center mt-4">
            <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-sm font-dm text-text-muted hover:text-gold transition-colors">
              Already have an account? <span className="font-bold underline underline-offset-4">Log in</span>
            </button>
          </div>
        </form>
      )}

      {/* ── VERIFY OTP FORM ────────────────────── */}
      {mode === "verify" && (
        <form action={handleVerify} className="space-y-5">
          <input type="hidden" name="email" value={emailForVerification} />
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-muted font-bold font-dm mb-2">6-Digit Code</label>
            <input type="text" name="otp" required className="w-full bg-transparent border-b border-gold/30 py-2 inset-shadow-xs focus:outline-none focus:border-forest text-forest tracking-[0.2em] font-mono transition-colors" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-forest text-white uppercase tracking-[0.15em] text-sm font-bold transition-all disabled:opacity-70 hover:bg-forest/90">
            {isLoading ? "Verifying..." : "Verify & Enter"}
          </button>

          {/* Resend OTP */}
          <div className="mt-5 text-center">
            {resendMessage && (
              <p className="text-forest font-dm text-xs mb-2 bg-emerald-50 p-2 border border-emerald-200">
                {resendMessage}
              </p>
            )}
            <button
              type="button"
              disabled={resendCooldown > 0 || isLoading}
              onClick={async () => {
                setResendMessage("");
                setError("");
                const result = await resendOtp(emailForVerification, verifyContext);
                if (result.error) {
                  setError(result.error);
                } else if (result.success) {
                  setResendMessage(result.success);
                  setResendCooldown(10);
                }
              }}
              className="text-text-muted font-dm text-sm hover:text-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive the code? Resend"}
            </button>
          </div>

          {/* Back to login */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setMessage(""); setResendMessage(""); }}
              className="text-sm font-dm text-text-muted hover:text-gold transition-colors underline underline-offset-4"
            >
              Cancel and return to login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
