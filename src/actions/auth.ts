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

  redirect("/profile");
}

export async function signupWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  // Supabase will now naturally catch real duplicates here!
  if (error) {
    return { error: error.message }; // Will output "User already registered"
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

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/profile");
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

  if (error) return { error: error.message };
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
    type: 'magiclink',
  });

  if (error) return { error: error.message };
  redirect("/profile");
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