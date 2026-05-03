"use server";

import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import OrderReceipt from "@/emails/OrderReceipt";
import { Resend } from "resend";
import Razorpay from "razorpay";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

/* ─── Types ──────────────────────────────────────────── */

interface RazorpayPaymentDetails {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  name?: string;
  variant?: string | null;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  fullAddress: string;
  pincode: string;
  city?: string;
  state?: string;
}


/* ─── Razorpay Order Creation ────────────────────────── */

export async function createRazorpayOrder(amountInRs: number) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return { error: "Razorpay keys not configured" };
  }
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  const options = {
    amount: amountInRs * 100,
    currency: "INR",
    receipt: "rcpt_" + Math.random().toString(36).substring(2, 9),
  };

  try {
    const order = await razorpay.orders.create(options);
    return { 
      success: true, 
      orderId: order.id, 
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return { error: message };
  }
}

/* ─── Order Processing After Payment ─────────────────── */

export async function processOrderAfterPayment(
  totalAmount: number,
  items: CheckoutItem[],
  addressData?: ShippingAddress,
  paymentDetails?: RazorpayPaymentDetails
) {
  try {
    // Verify Razorpay signature
    if (paymentDetails?.razorpay_order_id) {
      const crypto = require("crypto");
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "");
      hmac.update(paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id);
      const generated_signature = hmac.digest('hex');
      
      if (generated_signature !== paymentDetails.razorpay_signature) {
        return { success: false, message: "Payment verification failed. Invalid signature." };
      }
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
      const { data, error } = await (supabase as any)
        .from("orders")
        .insert({
          id: orderId,
          total_amount: totalAmount,
          status: "paid",
          user_id: user ? user.id : null,
          customer_name: addressData?.fullName || null,
          customer_email: addressData?.email || user?.email || null,
          phone: addressData?.phone || null,
          ...(paymentDetails?.razorpay_order_id && {
            razorpay_order_id: paymentDetails.razorpay_order_id,
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
          }),
        })
        .select("id")
        .single();

      if (!error) {
        order = data;
        break;
      }
      if (error.code === "23505") {
        // Duplicate — increment and retry
        nextId++;
        orderId = `MV-${nextId}`;
        continue;
      }
      if (error.code === "42501") break; // RLS — order may still have been created
      throw error;
    }

    const finalOrderId = order?.id || orderId;

    // Insert order items
    if (order && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await (supabase as any)
        .from("order_items")
        .insert(orderItems);

      if (itemsError && itemsError.code !== "42501") throw itemsError;

      // Deduct inventory
      try {
        await Promise.all(items.map(async (item) => {
          const { data: p } = await (supabase as any)
            .from("products")
            .select("inventory_count")
            .eq("id", item.product_id)
            .single();
          if (p) {
            await (supabase as any)
              .from("products")
              .update({ inventory_count: Math.max(0, (p.inventory_count || 0) - item.quantity) })
              .eq("id", item.product_id);
          }
        }));
      } catch {
        // Don't abort checkout for inventory errors
      }
    }

    // Send email receipt
    if (addressData) {
      try {
        const html = await render(
          OrderReceipt({
            orderId: finalOrderId,
            customerName: addressData.fullName,
            totalAmount: `₹${totalAmount.toLocaleString("en-IN")}`,
            items: items.map((i) => ({
              name: i.name || `Product ID: ${i.product_id}`,
              variant: i.variant,
              quantity: i.quantity,
              price: i.unit_price,
            })),
            shippingAddress: `${addressData.fullAddress}${addressData.city ? `, ${addressData.city}` : ""}${addressData.state ? `, ${addressData.state}` : ""} - ${addressData.pincode}`,
          }) as React.ReactElement
        );

        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: "Mrudula Vastra <orders@mrudulavastra.in>",
            to: addressData.email || user?.email || "customer@example.com",
            subject: "Order Confirmed - Mrudula Vastra",
            html,
          });
        }
      } catch {
        // Don't abort checkout if email fails
      }
    }

    return {
      success: true,
      orderId: finalOrderId,
      message: "Order placed successfully!",
    };
  } catch (error: unknown) {
    console.error("Error processing checkout:", error);
    const message = error instanceof Error ? error.message : "Failed to process checkout";
    return { success: false, message };
  }
}
