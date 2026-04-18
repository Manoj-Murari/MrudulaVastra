import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import type { Metadata } from "next";
import { User, LogOut } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AuthForms from "./AuthForms";
import DashboardTabs from "./DashboardTabs";

export const metadata: Metadata = {
  title: "My Profile — Mrudula Vastra",
  description: "Manage your Mrudula Vastra account and view order history.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orders = [];
  let profile = null;

  if (user) {
    // Fetch user's profile and orders in parallel
    const [{ data: fetchedOrders }, { data: fetchedProfile }] = await Promise.all([
      (supabase as any)
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
    ]);
    orders = fetchedOrders || [];
    profile = fetchedProfile;
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "Guest";

  return (
    <main className="min-h-screen bg-cream">
      <Breadcrumb items={[{ label: "My Account" }]} />
      
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-16 lg:py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-forest/10 rounded-full flex items-center justify-center shadow-inner">
            <User size={32} className="text-forest" />
          </div>
          <h1 className="font-playfair text-forest font-bold text-3xl lg:text-4xl mb-2">
            {user ? `Welcome, ${displayName.split(" ")[0]}` : "My Account"}
          </h1>
          <p className="text-text-muted font-dm text-sm">
            {user ? user.email : "Sign in to elevate your shopping experience."}
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pb-24 space-y-8">
        {!user ? (
          <AuthForms />
        ) : (
          <>
            <DashboardTabs profile={profile} orders={orders} userEmail={user.email || ""} />
            
            {/* Sign Out */}
            <form action={signOut}>
              <button
                type="submit"
                className="w-full py-4 bg-transparent border border-red-200 text-red-600 uppercase tracking-[0.15em] text-sm font-bold font-dm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

