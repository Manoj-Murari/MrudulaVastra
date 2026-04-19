"use server";

import { createClient } from "@/lib/supabase/server";

import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { ...(profile || {}), email: user.email };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updates = {
    id: user.id,
    full_name: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    pincode: formData.get("pincode") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    full_address: formData.get("fullAddress") as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any)
    .from("profiles")
    .upsert(updates);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  
  return { success: "Profile updated successfully" };
}
