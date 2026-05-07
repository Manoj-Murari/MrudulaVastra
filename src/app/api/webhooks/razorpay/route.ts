import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js"; // Use service role for webhooks

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn("Razorpay webhook secret not configured. Skipping verification.");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // We specifically want to handle payment.captured or order.paid
    if (event.event === "payment.captured") {
      const paymentPayload = event.payload.payment.entity;
      const razorpayOrderId = paymentPayload.order_id;
      
      // Initialize Supabase admin client to bypass RLS since this is a server-to-server call
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check if order exists with this razorpay_order_id
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select("id, status, total_amount, customer_email, customer_name")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Webhook DB Error:", error.message);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (order && order.status === "pending") {
        // 1. Update order status to paid
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            razorpay_payment_id: paymentPayload.id,
            total_amount: paymentPayload.amount / 100
          })
          .eq("id", order.id);

        if (!updateError) {
          // 2. Fetch order items to deduct inventory
          const { data: items } = await supabaseAdmin
            .from("order_items")
            .select("product_id, quantity, variant")
            .eq("order_id", order.id);

          if (items && items.length > 0) {
            // Deduct inventory
            for (const item of items) {
              const { data: p } = await supabaseAdmin
                .from("products")
                .select("inventory_count, variants")
                .eq("id", item.product_id)
                .single();
                
              if (p) {
                const updatePayload: any = {
                  inventory_count: Math.max(0, (p.inventory_count || 0) - item.quantity)
                };

                if (p.variants && Array.isArray(p.variants) && item.variant) {
                  const variantsCopy = [...p.variants];
                  const sizeInvIdx = variantsCopy.findIndex((v: any) => v && v.type === "size_inventory");
                  if (sizeInvIdx !== -1 && variantsCopy[sizeInvIdx].data) {
                    const sizeData = { ...variantsCopy[sizeInvIdx].data };
                    if (sizeData[item.variant] !== undefined) {
                      sizeData[item.variant] = Math.max(0, (sizeData[item.variant] as number) - item.quantity);
                      variantsCopy[sizeInvIdx] = { ...variantsCopy[sizeInvIdx], data: sizeData };
                      updatePayload.variants = variantsCopy;
                    }
                  }
                }

                await supabaseAdmin
                  .from("products")
                  .update(updatePayload)
                  .eq("id", item.product_id);
              }
            }
          }
          // Email sending could be triggered here or separated
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
