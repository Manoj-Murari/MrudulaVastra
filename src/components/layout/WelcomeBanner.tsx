"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WelcomeBanner() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await (supabase as any)
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          if (data?.full_name) {
            setFirstName(data.full_name.split(' ')[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching welcome profile:", err);
      }
    }
    fetchUser();
  }, []);

  if (!firstName) return null;

  return (
    <div className="hidden sm:block w-full bg-cream py-3.5 border-b border-gold/15 overflow-hidden animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="font-cormorant text-[1rem] lg:text-xl text-forest italic tracking-wide">
          Welcome back to Mrudula Vastra, {firstName} ✨
        </p>
      </div>
    </div>
  );
}
