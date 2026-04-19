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

interface OrderInsertPayload {
  total_amount: number;
  status: string;
  user_id: string | null;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
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
    if (paymentDetails?.razorpay_order_id) {
      const crypto = require("crypto");
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "");
      hmac.update(paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id);
      const generated_signature = hmac.digest('hex');
      
      if (generated_signature !== paymentDetails.razorpay_signature) {
        return { success: false, message: "Payment verification failed. Invalid signature." };
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const insertPayload: OrderInsertPayload = {
      total_amount: totalAmount,
      status: "paid",
      user_id: user ? user.id : null,
    };
    
    if (paymentDetails?.razorpay_order_id) {
      insertPayload.razorpay_order_id = paymentDetails.razorpay_order_id;
      insertPayload.razorpay_payment_id = paymentDetails.razorpay_payment_id;
    }

    let { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .insert(insertPayload)
      .select("id")
      .single();

    if (orderError) {
      // Fallback if razorpay columns haven't been created yet
      if (orderError.code === "42703") {
        const fallback = await (supabase as any)
          .from("orders")
          .insert({
            total_amount: totalAmount,
            status: "paid",
            user_id: user ? user.id : null,
          })
          .select("id")
          .single();
        order = fallback.data;
        orderError = fallback.error;
      }
      
      if (orderError) {
        if (orderError.code !== "42501" && !orderError.message.includes("row-level security")) {
          throw orderError;
        }
      }
    }

    const mockOrderId = order?.id || "MOCK-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Write order items to Supabase
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
    }

    // Send email receipt via Resend
    if (addressData) {
      try {
        const orderItems = items.map((i) => ({
          name: i.name || `Product ID: ${i.product_id}`,
          variant: i.variant,
          quantity: i.quantity,
          price: i.unit_price,
        }));

        const html = await render(
          OrderReceipt({
            orderId: mockOrderId,
            customerName: addressData.fullName,
            totalAmount: `₹${totalAmount.toLocaleString("en-IN")}`,
            items: orderItems,
            shippingAddress: `${addressData.fullAddress}${addressData.city ? `, ${addressData.city}` : ""}${addressData.state ? `, ${addressData.state}` : ""} - ${addressData.pincode}`,
          }) as React.ReactElement
        );

        if (process.env.RESEND_API_KEY) {
          const targetEmail = addressData.email || user?.email || "customer@example.com";
          await resend.emails.send({
            from: "Mrudula Vastra <orders@mrudulavastra.in>",
            to: targetEmail, 
            subject: "Order Confirmed - Mrudula Vastra",
            html: html,
          });
        }
      } catch {
        // Do not abort checkout if email fails
      }
    }

    return {
      success: true,
      orderId: mockOrderId,
      message: "Order placed successfully!",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process checkout";
    return {
      success: false,
      message,
    };
  }
}
