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
    (supabase as any).from("orders").select("id, total_amount, status, created_at").neq("status", "cancelled"),
    (supabase as any).from("products").select("id, name, category, price, inventory_count, is_trending, image"),
    (supabase as any).from("profiles").select("id, full_name, phone"),
    (supabase as any)
      .from("orders")
      .select("id, total_amount, status, created_at, user_id")
      .neq("status", "cancelled")
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

import { Resend } from "resend";
import { render } from "@react-email/render";
import OrderShipped from "@/emails/OrderShipped";
import OrderDelivered from "@/emails/OrderDelivered";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function updateOrderStatus(
  orderId: string, 
  newStatus: string,
  carrierName?: string,
  trackingId?: string,
  customerEmail?: string
) {
  console.log(`\n=== [updateOrderStatus] START ===`);
  console.log(`  orderId: ${orderId}`);
  console.log(`  newStatus: ${newStatus}`);
  console.log(`  carrierName: ${carrierName}`);
  console.log(`  trackingId: ${trackingId}`);
  console.log(`  customerEmail (param): ${customerEmail}`);

  const supabase = await createClient();
  
  const updateData: any = { status: newStatus };
  if (carrierName) updateData.carrier_name = carrierName;
  if (trackingId) updateData.tracking_id = trackingId;
  if (customerEmail) updateData.customer_email = customerEmail;

  console.log(`  updateData:`, JSON.stringify(updateData));

  // Step 1: Update the order (no .select() — avoids RLS RETURNING issue)
  const { error: updateError } = await (supabase as any)
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (updateError) {
    console.error(`  [ERROR] Supabase update failed:`, JSON.stringify(updateError));
    return { error: updateError.message };
  }

  console.log(`  [OK] Supabase update succeeded.`);

  // Step 2: Fetch the updated order data separately
  const { data: orderData, error: selectError } = await (supabase as any)
    .from("orders")
    .select("customer_name, customer_email, user_id, carrier_name, tracking_id")
    .eq("id", orderId)
    .single();

  if (selectError) {
    console.error(`  [WARN] Could not fetch order data for email:`, JSON.stringify(selectError));
    // Update succeeded, just can't send email
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  }

  console.log(`  [OK] Order data fetched:`, JSON.stringify(orderData));

  const email = orderData?.customer_email;
  const name = orderData?.customer_name || "Customer";

  console.log(`  Target Email: ${email}`);
  console.log(`  Customer Name: ${name}`);
  console.log(`  RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
  console.log(`  RESEND_API_KEY starts with: ${process.env.RESEND_API_KEY?.substring(0, 6)}...`);

  if (!process.env.RESEND_API_KEY) {
    console.log(`  [SKIP] No RESEND_API_KEY — skipping email`);
  } else if (!email) {
    console.log(`  [SKIP] No customer email — skipping email`);
  } else {
    console.log(`  [SENDING] Attempting to send ${newStatus} email to ${email}...`);
    try {
      if (newStatus.toLowerCase() === "shipped") {
        console.log(`  [RENDER] Rendering OrderShipped template...`);
        const html = await render(
          OrderShipped({
            orderId,
            customerName: name,
            carrierName: orderData.carrier_name || "Courier",
            trackingId: orderData.tracking_id || "N/A",
          }) as React.ReactElement
        );
        console.log(`  [RENDER OK] HTML length: ${html.length}`);
        
        const result = await resend.emails.send({
          from: "Mrudula Vastra <orders@mrudulavastra.in>",
          to: email,
          subject: `Your Order ${orderId} has been Shipped!`,
          html,
        });
        console.log(`  [RESEND RESULT]`, JSON.stringify(result));
        
      } else if (newStatus.toLowerCase() === "delivered") {
        console.log(`  [RENDER] Rendering OrderDelivered template...`);
        const html = await render(
          OrderDelivered({
            orderId,
            customerName: name,
          }) as React.ReactElement
        );
        console.log(`  [RENDER OK] HTML length: ${html.length}`);
        
        const result = await resend.emails.send({
          from: "Mrudula Vastra <orders@mrudulavastra.in>",
          to: email,
          subject: `Your Order ${orderId} has been Delivered!`,
          html,
        });
        console.log(`  [RESEND RESULT]`, JSON.stringify(result));
      } else {
        console.log(`  [SKIP] Status "${newStatus}" does not trigger an email`);
      }
    } catch (e) {
      console.error(`  [EMAIL ERROR] Failed to send:`, e);
    }
  }

  console.log(`=== [updateOrderStatus] END ===\n`);

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function createOfflineOrder(data: {
  customerName: string;
  phone: string;
  productId: number;
  size?: string;
  quantity: number;
  paymentMode: string;
}) {
  const supabase = await createClient();
  
  const { data: product } = await (supabase as any)
    .from('products')
    .select('price, inventory_count, variants')
    .eq('id', data.productId)
    .single();

  if (!product) return { error: "Product not found" };

  let currentStock = product.inventory_count;
  let newVariants = product.variants;

  if (data.size) {
    const sizeName = data.size; // Fix TS type inference
    const sizeInvVariant = (product.variants || []).find((v: any) => v.type === 'size_inventory');
    if (sizeInvVariant && sizeInvVariant.data[sizeName] !== undefined) {
      currentStock = sizeInvVariant.data[sizeName];
      if (currentStock < data.quantity) return { error: `Insufficient stock for size ${sizeName}` };
      
      newVariants = product.variants.map((v: any) => {
         if (v.type === 'size_inventory') {
             return {
                 ...v,
                 data: { ...v.data, [sizeName]: v.data[sizeName] - data.quantity }
             };
         }
         return v;
      });
    } else {
      return { error: `Size ${sizeName} is not available` };
    }
  } else {
    if (product.inventory_count < data.quantity) return { error: "Insufficient stock" };
  }

  const totalAmount = product.price * data.quantity;

  // Determine next sequential order ID
  let nextId = 1001;
  try {
    const { data: existingOrders } = await (supabase as any).from("orders").select("id");
    if (existingOrders && existingOrders.length > 0) {
      const nums = existingOrders
        .map((o: any) => {
          if (!o.id) return NaN;
          const raw = o.id.startsWith("MV-") ? o.id.slice(3) : o.id;
          return parseInt(raw, 10);
        })
        .filter((n: number) => !isNaN(n));
      if (nums.length > 0) nextId = Math.max(...nums) + 1;
    }
  } catch {
    // RLS may limit visibility — fall back to default
  }

  // Insert order with retry on duplicate ID
  let orderId = `MV-${nextId}`;
  let order: any = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data: insertedOrder, error } = await (supabase as any).from('orders').insert({
      id: orderId,
      total_amount: totalAmount,
      status: 'paid',
      user_id: null,
      customer_name: data.customerName,
      phone: data.phone,
      payment_mode: data.paymentMode
    }).select().single();

    if (!error) {
      order = insertedOrder;
      break;
    }
    if (error.code === "23505") {
      nextId++;
      orderId = `MV-${nextId}`;
      continue;
    }
    if (error.code === "42501") {
      order = { id: orderId };
      break;
    }
    return { error: error.message };
  }

  if (!order) return { error: "Failed to create order" };

  const { error: itemError } = await (supabase as any).from('order_items').insert({
    order_id: order.id,
    product_id: data.productId,
    quantity: data.quantity,
    unit_price: product.price,
    variant: data.size || null
  });

  if (itemError) return { error: itemError.message };

  const newInventoryCount = product.inventory_count - data.quantity;
  
  await (supabase as any).from('products').update({
     inventory_count: newInventoryCount,
     variants: newVariants
  }).eq('id', data.productId);

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true };
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();

  // 1. Fetch current order status first to prevent double-cancelling
  const { data: order, error: fetchError } = await (supabase as any)
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchError) return { error: fetchError.message };
  if (!order) return { error: "Order not found" };
  if (order.status === "cancelled") {
    return { error: "Order is already cancelled" };
  }

  // 2. Update order status
  const { error: orderError } = await (supabase as any)
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (orderError) return { error: orderError.message };

  // 2. Fetch items to restock
  const { data: items, error: itemsError } = await (supabase as any)
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (itemsError) return { error: itemsError.message };

  // 3. Increment inventory for each item
  if (items && items.length > 0) {
    const updatePromises = items.map(async (item: any) => {
      const { data: product } = await (supabase as any)
        .from("products")
        .select("inventory_count")
        .eq("id", item.product_id)
        .single();
      
      if (product) {
        return (supabase as any)
          .from("products")
          .update({ inventory_count: product.inventory_count + item.quantity })
          .eq("id", item.product_id);
      }
    });
    await Promise.all(updatePromises);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
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

export async function manageSubCategory(oldName: string, action: 'delete' | 'rename', newName?: string) {
  const supabase = await createClient();
  
  if (action === 'delete') {
    // Check if there are any products linked to this sub_category
    const { count, error: countError } = await (supabase as any)
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('sub_category', oldName);
      
    if (countError) return { error: countError.message };
    if (count && count > 0) {
      return { error: `Cannot delete sub-category "${oldName}" because ${count} product(s) are currently linked to it.` };
    }
    // If no products, we can safely delete it (or if it's managed somewhere else).
    // Wait, categories and subcategories are only tracked via the products table currently. 
    // Deleting them just means updating the products that have it, but here we enforce not doing that.
  } else if (action === 'rename' && newName) {
    const { error } = await (supabase as any)
      .from('products')
      .update({ sub_category: newName })
      .eq('sub_category', oldName);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { success: true };
}

export async function manageCategory(oldName: string, action: 'delete' | 'rename', newName?: string) {
  const supabase = await createClient();
  
  if (action === 'delete') {
    // Check if there are any products linked to this category
    const { count, error: countError } = await (supabase as any)
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', oldName);
      
    if (countError) return { error: countError.message };
    if (count && count > 0) {
      return { error: `Cannot delete category "${oldName}" because ${count} product(s) are currently linked to it.` };
    }
  } else if (action === 'rename' && newName) {
    const { error } = await (supabase as any)
      .from('products')
      .update({ category: newName })
      .eq('category', oldName);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { success: true };
}

export async function upsertProduct(product: Database["public"]["Tables"]["products"]["Insert"]) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("products")
    .upsert(product)
    .select()
    .single();
    
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true, data };
}

/* ─── Customer Data ───────────────────────────────────── */

export async function getAdminCustomers() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    (supabase as any).from("profiles").select("*"),
    (supabase as any).from("orders").select("user_id, total_amount").neq("status", "cancelled"),
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
