import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import type { Metadata } from "next";
import { User, Package, LogOut, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AddressManager from "@/components/profile/AddressManager";

export const metadata: Metadata = {
  title: "My Profile — Mrudula Vastra",
  description: "Manage your Mrudula Vastra account and view order history.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's orders and addresses in parallel
  const [{ data: orders }, { data: addresses }] = await Promise.all([
    (supabase as any)
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    (supabase as any)
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <main className="min-h-screen bg-cream">
      <Breadcrumb items={[{ label: "My Account" }]} />
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-20 lg:py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-forest/10 rounded-full flex items-center justify-center">
            <User size={32} className="text-forest" />
          </div>
          <h1 className="font-playfair text-forest font-bold text-3xl lg:text-4xl mb-2">
            My Account
          </h1>
          <p className="text-text-muted font-dm text-sm">{user.email}</p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-24 space-y-8">
        {/* Account Details Card */}
        <div className="bg-white border border-gold/10 p-8">
          <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] mb-4 text-[10px]">
            Account Details
          </p>
          <div className="space-y-4">
            {displayName !== user.email && (
              <div className="flex justify-between items-center py-3 border-b border-gold/8">
                <span className="text-text-muted font-dm text-sm">Name</span>
                <span className="text-forest font-dm font-medium text-sm">{displayName}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-gold/8">
              <span className="text-text-muted font-dm text-sm">Email</span>
              <span className="text-forest font-dm font-medium text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-muted font-dm text-sm">Member Since</span>
              <span className="text-forest font-dm font-medium text-sm">
                {new Date(user.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <AddressManager addresses={addresses || []} />

        {/* Order History Card */}
        <div className="bg-white border border-gold/10 p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="uppercase text-gold font-dm font-medium tracking-[0.3em] text-[10px]">
              Order History
            </p>
            <Package size={18} className="text-gold" />
          </div>

          {!orders || orders.length === 0 ? (
            <div className="text-center py-10">
              <Package size={40} strokeWidth={1} className="text-gold/30 mx-auto mb-4" />
              <p className="text-text-muted font-dm text-sm">No orders yet.</p>
              <Link
                href="/collections"
                className="inline-block mt-4 text-forest font-dm font-semibold text-sm underline underline-offset-4 hover:text-gold transition-colors"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-cream/50 border border-gold/8 hover:border-gold/20 transition-colors"
                >
                  <div>
                    <p className="font-dm text-forest font-medium text-sm">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-text-muted font-dm text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-dm text-forest font-semibold text-sm">
                        ₹{order.total_amount.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`inline-block text-[10px] uppercase tracking-wider font-bold font-dm px-2 py-0.5 ${
                          order.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-text-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-4 bg-white border border-red-200 text-red-600 uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </section>
    </main>
  );
}
