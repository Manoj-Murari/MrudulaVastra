"use server";

import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import OrderReceipt from "@/emails/OrderReceipt";
import { Resend } from "resend";
import Razorpay from "razorpay";
import { getShippingSettings } from "@/actions/shipping";
import { validateCoupon } from "@/actions/coupons";

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

export async function createRazorpayOrder(
  frontendTotal: number,
  items?: CheckoutItem[],
  couponCode?: string,
  addressData?: ShippingAddress
) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return { error: "Razorpay keys not configured" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "SESSION_EXPIRED" };
  }

  let finalAmountInRs = frontendTotal;
  
  if (items && items.length > 0) {
    let calculatedCartTotal = 0;
    
    // Validate each item for stale price and stock race conditions
    for (const item of items) {
      // PREVENT NEGATIVE/ZERO QUANTITY HACK
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return { error: `Invalid quantity for item ${item.product_id}.` };
      }

      const { data: product } = await (supabase as any)
        .from("products")
        .select("price, inventory_count, variants, name")
        .eq("id", item.product_id)
        .single();
        
      if (!product) {
        return { error: `Product ${item.product_id} not found.` };
      }
      
      let availableStock = product.inventory_count;
      if (item.variant && product.variants) {
        const sizeInv = product.variants.find((v: any) => v.type === "size_inventory");
        if (sizeInv && sizeInv.data) {
          const variantParts = item.variant.split(" | ");
          const sizeName = variantParts.length > 1 ? variantParts[1] : item.variant;
          if (sizeInv.data[sizeName] !== undefined) {
            availableStock = sizeInv.data[sizeName];
          }
        }
      }
      
      if (availableStock < item.quantity) {
        return { error: `Insufficient stock for ${product.name}. Only ${availableStock} left.` };
      }
      
      calculatedCartTotal += product.price * item.quantity;
      item.unit_price = product.price; // Refresh price in the array if passing it along
    }
    
    // Apply coupon if valid
    let discount = 0;
    if (couponCode) {
      const res = await validateCoupon(couponCode, calculatedCartTotal);
      if (res.success && res.discountAmount) {
        discount = res.discountAmount;
      }
    }
    
    // Calculate shipping
    const settings = await getShippingSettings();
    let shippingFee = 100;
    if (settings) {
      shippingFee = calculatedCartTotal >= settings.minFreeShippingOrderValue ? 0 : settings.shippingCharge;
    }
    
    finalAmountInRs = calculatedCartTotal - discount + shippingFee;
  }
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  const options = {
    amount: finalAmountInRs * 100,
    currency: "INR",
    receipt: "rcpt_" + Math.random().toString(36).substring(2, 9),
  };

  try {
    const order = await razorpay.orders.create(options);
    
    // ==========================================
    // INSERT PENDING ORDER INTO DATABASE HERE
    // ==========================================
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

    let orderId = `MV-${nextId}`;
    let dbOrder: any = null;

    for (let attempt = 0; attempt < 10; attempt++) {
      const { data, error } = await (supabase as any)
        .from("orders")
        .insert({
          id: orderId,
          total_amount: finalAmountInRs,
          status: "pending", // Status is pending until payment is confirmed
          user_id: user ? user.id : null,
          customer_name: addressData?.fullName || null,
          customer_email: addressData?.email || user?.email || null,
          phone: addressData?.phone || null,
          razorpay_order_id: order.id
        })
        .select("id")
        .single();

      if (!error) {
        dbOrder = data;
        break;
      }
      if (error.code === "23505") {
        nextId++;
        orderId = `MV-${nextId}`;
        continue;
      }
      if (error.code === "42501") break;
      throw error;
    }

    const finalOrderId = dbOrder?.id || orderId;

    if (finalOrderId && items && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: finalOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant: item.variant || null,
      }));

      const { error: itemsError } = await (supabase as any)
        .from("order_items")
        .insert(orderItems);

      if (itemsError && itemsError.code !== "42501") throw itemsError;
    }
    // ==========================================

    return { 
      success: true, 
      orderId: order.id, 
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
      internalOrderId: finalOrderId
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
  if (!paymentDetails || !paymentDetails.razorpay_order_id) {
    return { success: false, message: "Missing payment details." };
  }

  try {
    // Verify Razorpay signature
    const crypto = require("crypto");
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "");
    hmac.update(paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    
    if (generated_signature !== paymentDetails.razorpay_signature) {
      return { success: false, message: "Payment verification failed. Invalid signature." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Determine correct amount paid from Razorpay instead of trusting frontend totalAmount
    let finalTotalAmount = totalAmount;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const orderData = await razorpay.orders.fetch(paymentDetails.razorpay_order_id);
      finalTotalAmount = (orderData.amount as number) / 100;
    }

    // ==========================================
    // Fetch the pending order created in createRazorpayOrder
    const { data: dbOrder, error: fetchError } = await (supabase as any)
      .from("orders")
      .select("id, status, total_amount")
      .eq("razorpay_order_id", paymentDetails.razorpay_order_id)
      .single();

    if (fetchError || !dbOrder) {
      return { success: false, message: "Order not found in database." };
    }

    if (dbOrder.status === "paid") {
      // Idempotency check: if already paid (e.g. by webhook), just return success
      return { success: true, orderId: dbOrder.id, message: "Order already processed." };
    }

    const finalOrderId = dbOrder.id;

    // Update order to paid
    const { error: updateError } = await (supabase as any)
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        total_amount: finalTotalAmount // Ensure it matches Razorpay's actual amount
      })
      .eq("id", finalOrderId);

    if (updateError) {
      throw updateError;
    }

    // Deduct inventory
    try {
      await Promise.all(items.map(async (item) => {
        const { data: p } = await (supabase as any)
          .from("products")
          .select("inventory_count, variants")
          .eq("id", item.product_id)
          .single();
        if (p) {
          const updatePayload: any = {
            inventory_count: Math.max(0, (p.inventory_count || 0) - item.quantity)
          };

          // Deduct from size inventory matrix if it exists
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

          await (supabase as any)
            .from("products")
            .update(updatePayload)
            .eq("id", item.product_id);
        }
      }));
    } catch (err) {
      console.error("Inventory deduction error:", err);
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
