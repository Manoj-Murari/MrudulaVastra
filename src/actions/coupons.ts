"use server";

import { createClient } from "@/lib/supabase/server";

export interface CouponResult {
  success: boolean;
  message: string;
  discountAmount?: number;
  code?: string;
  type?: "percentage" | "fixed";
  value?: number;
}

export interface Coupon {
  id?: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_purchase: number;
  is_active: boolean;
  created_at?: string;
}

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase as any).from("coupons").select("*").order("created_at", { ascending: false });
  
  if (error) {
    console.error("DB Coupons Error:", error.message);
    return [];
  }
  return data || [];
}

export async function validateCoupon(code: string, currentTotal: number): Promise<CouponResult> {
  const normalizedCode = code.trim().toUpperCase();
  const coupons = await getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === normalizedCode && c.is_active);

  if (!coupon) {
    return { success: false, message: "Invalid or expired coupon code." };
  }

  if (currentTotal < coupon.min_purchase) {
    return { 
      success: false, 
      message: `Minimum purchase of ₹${coupon.min_purchase.toLocaleString("en-IN")} required.` 
    };
  }

  const discountAmount = coupon.type === "percentage" 
    ? Math.round((currentTotal * coupon.value) / 100)
    : coupon.value;

  return {
    success: true,
    message: `Applied! Saved ₹${discountAmount.toLocaleString("en-IN")}.`,
    discountAmount,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value
  };
}

export async function upsertCoupon(coupon: Coupon) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any).from("coupons").upsert(coupon).select().single();
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("coupons").update({ is_active: !currentStatus }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getActiveCouponsCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await (supabase as any)
    .from("coupons")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) return 0;
  return count || 0;
}
