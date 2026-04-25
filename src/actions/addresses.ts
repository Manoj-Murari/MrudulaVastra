"use server";

import { createClient } from "@/lib/supabase/server";

/* ── Types ──────────────────────────────────────────── */

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/* ── Fetch all addresses for current user ────────────── */

export async function getUserAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (supabase as any)
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

/* ── Add a new address ───────────────────────────────── */

export async function addAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const label = formData.get("label")?.toString() || "Home";
  const full_name = formData.get("fullName")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const full_address = formData.get("fullAddress")?.toString() || "";
  const city = formData.get("city")?.toString() || "";
  const state = formData.get("state")?.toString() || "";
  const pincode = formData.get("pincode")?.toString() || "";
  const is_default = formData.get("isDefault") === "true";

  if (!full_name || !phone || !full_address || !city || !state || !pincode) {
    return { error: "All fields are required." };
  }

  // If setting as default, unset other defaults first
  if (is_default) {
    await (supabase as any)
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await (supabase as any)
    .from("addresses")
    .insert({
      user_id: user.id,
      label,
      full_name,
      phone,
      full_address,
      city,
      state,
      pincode,
      is_default,
    });

  if (error) {
    if (error.message?.includes("Maximum 5")) {
      return { error: "You can save up to 5 addresses. Please delete one to add a new one." };
    }
    return { error: error.message };
  }

  return { success: "Address saved successfully!" };
}

/* ── Update an existing address ──────────────────────── */

export async function updateAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const id = formData.get("addressId")?.toString();
  if (!id) return { error: "Address ID missing." };

  const label = formData.get("label")?.toString() || "Home";
  const full_name = formData.get("fullName")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const full_address = formData.get("fullAddress")?.toString() || "";
  const city = formData.get("city")?.toString() || "";
  const state = formData.get("state")?.toString() || "";
  const pincode = formData.get("pincode")?.toString() || "";
  const is_default = formData.get("isDefault") === "true";

  if (!full_name || !phone || !full_address || !city || !state || !pincode) {
    return { error: "All fields are required." };
  }

  if (is_default) {
    await (supabase as any)
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await (supabase as any)
    .from("addresses")
    .update({
      label,
      full_name,
      phone,
      full_address,
      city,
      state,
      pincode,
      is_default,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: "Address updated!" };
}

/* ── Delete an address ───────────────────────────────── */

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { error } = await (supabase as any)
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: "Address deleted." };
}

/* ── Set an address as default ───────────────────────── */

export async function setDefaultAddress(addressId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  // Unset all defaults
  await (supabase as any)
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set the chosen one
  const { error } = await (supabase as any)
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: "Default address updated!" };
}

/* ── Save address from checkout (simplified) ─────────── */

export async function saveAddressFromCheckout(addressData: {
  label: string;
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { error } = await (supabase as any)
    .from("addresses")
    .insert({
      user_id: user.id,
      label: addressData.label || "Home",
      full_name: addressData.fullName,
      phone: addressData.phone,
      full_address: addressData.fullAddress,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      is_default: false,
    });

  if (error) {
    if (error.message?.includes("Maximum 5")) {
      return { error: "Max 5 addresses reached." };
    }
    return { error: error.message };
  }

  return { success: "Address saved to your profile!" };
}
