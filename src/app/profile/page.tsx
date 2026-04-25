import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { getUserAddresses } from "@/actions/addresses";
import type { Metadata } from "next";
import { User, LogOut } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AuthForms from "./AuthForms";
import DashboardTabs from "./DashboardTabs";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "My Profile — Mrudula Vastra",
  description: "Manage your Mrudula Vastra account and view order history.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orders = [];
  let profile = null;
  let addresses: any[] = [];

  if (user) {
    // Fetch user's profile, orders, and addresses in parallel
    const [{ data: fetchedOrders }, { data: fetchedProfile }, fetchedAddresses] = await Promise.all([
      (supabase as any)
        .from("orders")
        .select("*, order_items(*, products(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
      getUserAddresses()
    ]);
    orders = fetchedOrders || [];
    profile = fetchedProfile;
    addresses = fetchedAddresses || [];
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "Guest";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-cream">

        {/* ── Mobile/Tablet Hero (only for logged-in users) ── */}
        {user && (
          <section className="lg:hidden relative py-8 sm:py-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-forest/5 to-transparent" />
            <div className="relative z-10 max-w-3xl mx-auto px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-forest/10 rounded-full flex items-center justify-center shadow-inner">
                <User size={28} className="text-forest" />
              </div>
              <h1 className="font-playfair text-forest font-bold text-xl sm:text-2xl mb-1 sm:mb-2">
                Welcome, {displayName.split(" ")[0]}
              </h1>
              <p className="text-text-muted font-dm text-xs sm:text-sm">
                {user.email}
              </p>
            </div>
          </section>
        )}

        {/* ── Mobile/Tablet Content ────────── */}
        <section className="lg:hidden max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {!user ? (
            <AuthForms />
          ) : (
            <>
              <DashboardTabs profile={profile} orders={orders} userEmail={user.email || ""} addresses={addresses} />
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

        {/* ── LG: Two-Column Layout (Guest) ────────────── */}
        {!user && (
          <section className="hidden lg:flex min-h-[calc(100vh-200px)] max-w-6xl mx-auto px-10">
            {/* Left: Branding */}
            <div className="w-1/2 flex flex-col justify-center pr-20 border-r border-gold/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-4">Account</p>
              <h1 className="font-playfair text-forest font-bold text-5xl leading-tight mb-4">
                My Account
              </h1>
              <p className="text-text-muted font-dm text-sm leading-relaxed max-w-sm">
                Sign in to access your orders, saved details, and a curated shopping experience tailored just for you.
              </p>
              <div className="mt-8 flex items-center gap-3 text-text-muted/60">
                <div className="h-px w-12 bg-gold/30" />
                <p className="text-[9px] uppercase tracking-[0.25em] font-dm">Secure &amp; Private</p>
              </div>
            </div>

            {/* Right: Login Form */}
            <div className="w-1/2 flex items-center justify-center pl-20">
              <AuthForms />
            </div>
          </section>
        )}

        {/* ── LG: Dashboard Layout (Logged In) ─────────── */}
        {user && (
          <section className="hidden lg:block">
            {/* Compact Welcome Strip */}
            <div className="border-b border-gold/10 bg-sand/30">
              <div className="max-w-5xl mx-auto px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-forest/10 rounded-full flex items-center justify-center">
                    <User size={22} className="text-forest" />
                  </div>
                  <div>
                    <h1 className="font-playfair text-forest font-bold text-2xl">
                      Welcome, {displayName.split(" ")[0]}
                    </h1>
                    <p className="text-text-muted font-dm text-sm">{user.email}</p>
                  </div>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-transparent border border-red-200 text-red-500 uppercase tracking-[0.15em] text-[10px] font-bold font-dm hover:bg-red-50 transition-colors flex items-center gap-2 rounded-sm"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </form>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-5xl mx-auto px-10 py-10">
              <DashboardTabs profile={profile} orders={orders} userEmail={user.email || ""} addresses={addresses} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

