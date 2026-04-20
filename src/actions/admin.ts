"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

/* ─── Domain Types ───────────────────────────────────── */

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = { id: string; full_name: string | null; phone: string | null };

interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryBreakdown {
  name: string;
  count: number;
  revenue: number;
}

/* ─── Analytics Aggregators ───────────────────────────── */

export async function getAdminOverview() {
  const supabase = await createClient();

  const [
    { data: orders },
    { data: products },
    { data: profiles },
    { data: recentOrders },
  ] = await Promise.all([
    (supabase as any).from("orders").select("id, total_amount, status, created_at"),
    (supabase as any).from("products").select("id, name, category, price, inventory_count, is_trending, image"),
    (supabase as any).from("profiles").select("id, full_name, phone"),
    (supabase as any)
      .from("orders")
      .select("id, total_amount, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allOrders: Order[] = orders || [];
  const allProducts: Product[] = products || [];
  const allProfiles: Profile[] = profiles || [];

  // KPIs
  const totalRevenue = allOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Revenue by month (last 6 months)
  const now = new Date();
  const revenueByMonth: RevenueByMonth[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const monthOrders = allOrders.filter((o) => {
      const created = new Date(o.created_at);
      return created >= start && created <= end;
    });

    revenueByMonth.push({
      month: monthKey,
      revenue: monthOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0),
      orders: monthOrders.length,
    });
  }

  // Category breakdown
  const categoryMap: Record<string, { count: number; revenue: number }> = {};
  allProducts.forEach((p) => {
    if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, revenue: 0 };
    categoryMap[p.category].count += 1;
    categoryMap[p.category].revenue += p.price;
  });
  const categories: CategoryBreakdown[] = Object.entries(categoryMap).map(([name, data]) => ({ name, ...data }));

  // Action items
  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const lowStockProducts = allProducts.filter((p) => p.inventory_count <= 2);
  const outOfStock = allProducts.filter((p) => p.inventory_count === 0);

  return {
    kpis: {
      totalRevenue,
      totalOrders: allOrders.length,
      avgOrderValue: Math.round(avgOrderValue),
      totalCustomers: allProfiles.length,
      totalProducts: allProducts.length,
    },
    revenueByMonth,
    categories,
    actionItems: {
      pendingOrders,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStock.length,
      lowStockProducts: lowStockProducts.slice(0, 5),
    },
    recentOrders: recentOrders || [],
  };
}

/* ─── Order Management ────────────────────────────────── */

export async function getAdminOrders() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from("orders")
    .select("*, order_items(*, products(name, image, category))")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

/* ─── Product Management ──────────────────────────────── */

export async function getAdminProducts() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from("products")
    .select("*")
    .order("id", { ascending: false });
  return data || [];
}

export async function updateProductField(productId: number, field: string, value: string | number | boolean) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("products")
    .update({ [field]: value })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteProduct(productId: number) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true };
}

export async function upsertProduct(product: Database["public"]["Tables"]["products"]["Insert"]) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("products")
    .upsert(product);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true };
}

/* ─── Customer Data ───────────────────────────────────── */

export async function getAdminCustomers() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    (supabase as any).from("profiles").select("*"),
    (supabase as any).from("orders").select("user_id, total_amount"),
  ]);

  const orderMap: Record<string, { totalSpent: number; orderCount: number }> = {};
  (orders || []).forEach((o: { user_id: string | null; total_amount: number }) => {
    if (!o.user_id) return;
    if (!orderMap[o.user_id]) orderMap[o.user_id] = { totalSpent: 0, orderCount: 0 };
    orderMap[o.user_id].totalSpent += o.total_amount || 0;
    orderMap[o.user_id].orderCount += 1;
  });

  return (profiles || []).map((p: Profile & Record<string, unknown>) => ({
    ...p,
    ltv: orderMap[p.id]?.totalSpent || 0,
    orderCount: orderMap[p.id]?.orderCount || 0,
  }));
}
