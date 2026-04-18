"use server";

import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import OrderReceipt from "@/emails/OrderReceipt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function processMockCheckout(
  totalAmount: number,
  items: { product_id: number; quantity: number; unit_price: number; name?: string; variant?: string | null }[],
  addressData?: { fullName: string; phone: string; fullAddress: string; pincode: string }
) {
  try {
    // 1. Simulate 2-second Razorpay processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Ensure environment variables exist mathematically (simulating usage)
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RESEND_API_KEY) {
       console.warn("Keys missing but proceeding with mock execution...");
    }

    const supabase = await createClient();

    // 2. Generate a mock order row in Supabase
    // Using a dummy user_id or leaving it null based on schema
    const { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .insert({
        total_amount: totalAmount,
        status: "paid",
        // If your schema allows null user_id for guest checkout, we leave it out.
        // Otherwise, insert a UUID. Let's let the DB defaults handle user_id (it's nullable in our migration).
      })
      .select("id")
      .single();

    if (orderError) {
      if (orderError.code === "42501" || orderError.message.includes("row-level security")) {
        console.warn("⚠️ SUPABASE RLS ACTIVE: Skipping real insert. Proceeding with mock checkout flow.");
      } else {
        throw orderError;
      }
    }

    const mockOrderId = order?.id || "MOCK-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 3. Write order items to Supabase
    if (order && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      if (order) {
        const { error: itemsError } = await (supabase as any)
          .from("order_items")
          .insert(orderItems);

        if (itemsError && itemsError.code !== "42501") throw itemsError;
      }
    }

    // 4. Send Email Action (Resend)
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
            shippingAddress: `${addressData.fullAddress}, ${addressData.pincode}`,
          }) as React.ReactElement
        );

        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: "Mrudula Vastra <orders@mrudulavastra.com>",
            to: "customer@example.com", // In real scenario: use customer's verified email
            subject: "Order Confirmed - Mrudula Vastra",
            html: html,
          });
          console.log(`✅ Real email dispatched via Resend for order ${mockOrderId}`);
        } else {
          console.log("====================================");
          console.log("🟢 [RESEND MOCK] HTML RECEIPT GENERATED SUCCESSFULLY");
          console.log(
            `Will be sent to customer once RESEND_API_KEY is configured in Vercel.`
          );
          console.log("====================================");
        }
      } catch (err) {
        console.error("Failed to compile or send email receipt:", err);
        // Do not abort checkout if email fails
      }
    }

    return {
      success: true,
      orderId: mockOrderId,
      message: "Order placed successfully!",
    };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return {
      success: false,
      message: error.message || "Failed to process checkout",
    };
  }
}
