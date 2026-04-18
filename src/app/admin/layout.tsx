import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";

// The owner email — only this user can access /admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mrudulavastra.com";

export const metadata = {
  title: "Command Center — Mrudula Vastra",
  description: "Enterprise admin dashboard for Mrudula Vastra operations.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/profile");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
