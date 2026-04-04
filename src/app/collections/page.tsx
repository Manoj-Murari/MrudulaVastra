import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ShopGrid from "@/components/shop/ShopGrid";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Collections — Mrudula Vastra",
  description:
    "Browse our entire curated catalog of sarees, dress materials, and kids wear — handpicked for elegance and tradition.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data: products } = await (supabase as any)
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  return (
    <main className="min-h-screen bg-cream">
      <ShopGrid products={products || []} />
    </main>
  );
}
