import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import UnshippedOrdersReport from "@/emails/UnshippedOrdersReport";
import { render } from "@react-email/render";
import * as React from "react";

export async function GET(req: Request) {
  // Check Authorization header for Vercel Cron Secret
  const authHeader = req.headers.get("Authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = await createAdminClient();
    
    // Fetch unshipped orders (status 'paid' or 'processing')
    const { data: unshippedOrders, error } = await (supabaseAdmin as any)
      .from("orders")
      .select("id, customer_name, total_amount, created_at, status")
      .in("status", ["paid", "processing"])
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const orders = unshippedOrders || [];

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = await render(
        UnshippedOrdersReport({ orders }) as React.ReactElement
      );

      // Send email to admin
      await resend.emails.send({
        from: "Mrudula Vastra Reports <orders@mrudulavastra.in>",
        to: "mrudulavastra@gmail.com",
        subject: `Daily Unshipped Orders Report (${orders.length} Pending)`,
        html,
      });
    } else {
      console.warn("RESEND_API_KEY is not configured.");
    }

    return NextResponse.json({ success: true, count: orders.length });
  } catch (error: any) {
    console.error("Cron Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
