import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";

// The owner emails — only these users can access /admin
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "manojmurari3577@gmail.com").split(",").map(e => e.trim().toLowerCase());

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

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    redirect("/profile");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
