"use server";

import { createClient } from "@/lib/supabase/server";

export async function processMockCheckout(
  totalAmount: number,
  items: { product_id: number; quantity: number; unit_price: number }[]
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

    if (orderError) throw orderError;

    // 3. Write order items to Supabase
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

      if (itemsError) throw itemsError;
    }

    // 4. Mock Email Action (Resend)
    const mockEmailPayload = {
      to: "customer@example.com",
      subject: "Order Confirmed - Mrudula Vastra",
      orderId: order?.id,
      totalAmount: `₹${totalAmount.toLocaleString("en-IN")}`,
      customerName: "Valued Customer",
    };

    console.log("====================================");
    console.log("🟢 [RESEND MOCK] TRIGGERED EMAIL");
    console.log(JSON.stringify(mockEmailPayload, null, 2));
    console.log("====================================");

    return {
      success: true,
      orderId: order?.id,
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
