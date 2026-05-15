import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js"; // Use service role for webhooks
import { render } from "@react-email/render";
import OrderReceipt from "@/emails/OrderReceipt";
import { Resend } from "resend";

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
        .select("id, status, total_amount, customer_email, customer_name, shipping_address, shipping_city, shipping_state, shipping_pincode")
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
            total_amount: paymentPayload.amount / 100,
            payment_mode: paymentPayload.method ? paymentPayload.method.toUpperCase() : "ONLINE"
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
                    // Parse "Color | Size" format to extract the size name
                    const variantParts = item.variant.split(" | ");
                    const sizeName = variantParts.length > 1 ? variantParts[variantParts.length - 1] : item.variant;
                    if (sizeData[sizeName] !== undefined) {
                      sizeData[sizeName] = Math.max(0, (sizeData[sizeName] as number) - item.quantity);
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
          // Guarantee Email Sending from Webhook
          try {
            if (process.env.RESEND_API_KEY && order.customer_email) {
              const resend = new Resend(process.env.RESEND_API_KEY);
              const orderItemsForEmail = [];
              
              if (items && items.length > 0) {
                for (const item of items) {
                  const { data: p } = await supabaseAdmin.from("products").select("name, price").eq("id", item.product_id).single();
                  orderItemsForEmail.push({
                    name: p?.name || `Product ${item.product_id}`,
                    variant: item.variant,
                    quantity: item.quantity,
                    price: p?.price || 0
                  });
                }
              }

              const shippingAddressFormatted = `${order.shipping_address || ""}${order.shipping_city ? `, ${order.shipping_city}` : ""}${order.shipping_state ? `, ${order.shipping_state}` : ""} - ${order.shipping_pincode || ""}`;

              const customerHtml = await render(
                OrderReceipt({
                  orderId: order.id,
                  customerName: order.customer_name || "Valued Customer",
                  totalAmount: `₹${order.total_amount.toLocaleString("en-IN")}`,
                  items: orderItemsForEmail,
                  shippingAddress: shippingAddressFormatted,
                  isAdmin: false,
                }) as React.ReactElement
              );

              const adminHtml = await render(
                OrderReceipt({
                  orderId: order.id,
                  customerName: order.customer_name || "Valued Customer",
                  totalAmount: `₹${order.total_amount.toLocaleString("en-IN")}`,
                  items: orderItemsForEmail,
                  shippingAddress: shippingAddressFormatted,
                  isAdmin: true,
                }) as React.ReactElement
              );

              // 1. Send to Customer
              await resend.emails.send({
                from: "Mrudula Vastra <orders@mrudulavastra.in>",
                to: order.customer_email,
                subject: "Order Confirmed - Mrudula Vastra",
                html: customerHtml,
              });

              // 2. Send Notification to Admin
              await resend.emails.send({
                from: "Mrudula Vastra Notifications <orders@mrudulavastra.in>",
                to: "mrudulavastra@gmail.com",
                subject: `New Order Received - ${order.id}`,
                html: adminHtml,
              });
            }
          } catch (emailError) {
            console.error("Webhook Email Send Error:", emailError);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
