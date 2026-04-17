"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add an address." };
  }

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address_line1 = formData.get("address_line1") as string;
  const address_line2 = (formData.get("address_line2") as string) || null;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;
  const is_default = formData.get("is_default") === "true";

  if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
    return { error: "Please fill in all required fields." };
  }

  // If setting as default, unset existing defaults first
  if (is_default) {
    await (supabase as any)
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  // Check if this is the first address — make it default automatically
  const { data: existingAddresses } = await (supabase as any)
    .from("addresses")
    .select("id")
    .eq("user_id", user.id);

  const shouldBeDefault = is_default || !existingAddresses || existingAddresses.length === 0;

  const { error } = await (supabase as any).from("addresses").insert({
    user_id: user.id,
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    is_default: shouldBeDefault,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Address added successfully!" };
}

export async function updateAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update an address." };
  }

  const id = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address_line1 = formData.get("address_line1") as string;
  const address_line2 = (formData.get("address_line2") as string) || null;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;
  const is_default = formData.get("is_default") === "true";

  if (!id || !full_name || !phone || !address_line1 || !city || !state || !pincode) {
    return { error: "Please fill in all required fields." };
  }

  // If setting as default, unset existing defaults first
  if (is_default) {
    await (supabase as any)
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await (supabase as any)
    .from("addresses")
    .update({
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      is_default,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Address updated successfully!" };
}

export async function deleteAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to delete an address." };
  }

  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Address ID is required." };
  }

  const { error } = await (supabase as any)
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Address deleted successfully!" };
}

export async function setDefaultAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Address ID is required." };
  }

  // Unset all defaults
  await (supabase as any)
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set new default
  const { error } = await (supabase as any)
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Default address updated!" };
}
