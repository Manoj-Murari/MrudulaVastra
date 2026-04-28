"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/* ── Signup WITH password (optional path) ────────────── */
export async function signupWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  if (!email || !password || !fullName || !phone) {
    return { error: "Name, email, phone, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  // Check if phone number already exists using a secure RPC function that bypasses RLS
  const { data: phoneExists } = await supabase
    .rpc('check_phone_exists', { phone_number: phone } as any);

  if (phoneExists) {
    return { error: "This phone number is already registered with another account." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for the verification code!" };
}

/* ── Signup WITHOUT password (OTP-only, primary path) ── */
export async function signupWithOtpOnly(formData: FormData) {
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  if (!email || !fullName || !phone) {
    return { error: "Name, email, and phone are required." };
  }

  const supabase = await createClient();

  // Check if phone number already exists using a secure RPC function that bypasses RLS
  const { data: phoneExists } = await supabase
    .rpc('check_phone_exists', { phone_number: phone } as any);

  if (phoneExists) {
    return { error: "This phone number is already registered with another account." };
  }

  // signInWithOtp with shouldCreateUser: true will create the account
  // if it doesn't exist, and send a magic link / OTP code
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for the verification code!" };
}

export async function verifySignupOtp(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("otp") as string;

  if (!email || !token) {
    return { error: "Email and OTP are required." };
  }

  const supabase = await createClient();

  // Try 'email' type first (for OTP-only signup via signInWithOtp)
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    // Fallback to 'signup' type (for password-based signup)
    const { error: error2 } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error2) {
      const msg = error2.message.toLowerCase().includes('expired') || error2.message.toLowerCase().includes('invalid')
        ? 'This code has expired or is invalid. Please request a new code.'
        : error2.message;
      return { error: msg };
    }
  }

  return { success: true };
}

export async function sendLoginOtp(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    }
  });

  if (error) {
    if (error.message.toLowerCase().includes("signups not allowed for otp")) {
      return { success: false, reason: "user_not_found", email };
    }
    return { error: error.message };
  }
  return { success: "Check your email for the login code!" };
}

export async function verifyLoginOtp(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("otp") as string;

  if (!email || !token) return { error: "Email and OTP are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    const msg = error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')
      ? 'This code has expired or is invalid. Please request a new code.'
      : error.message;
    return { error: msg };
  }
  return { success: true };
}

/* ── Resend OTP (works for both signup and login) ── */
export async function resendOtp(email: string, context: 'signup' | 'login') {
  if (!email) return { error: 'Email is required.' };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // For signup context, allow creating user (in case they haven't completed signup)
      // For login context, don't create new users
      shouldCreateUser: context === 'signup',
    },
  });

  if (error) return { error: error.message };
  return { success: 'A new verification code has been sent to your email!' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function checkIsAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) return false;
  
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "manojmurari3577@gmail.com")
    .split(",")
    .map(e => e.trim().toLowerCase());
    
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/* ── Helper: Check if current user is logged in (for cart gate) ── */
export async function checkIsLoggedIn() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}