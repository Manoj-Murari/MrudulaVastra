"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitEnquiry(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    subject,
    message,
    status: "pending",
  } as any);

  if (error) {
    console.error("Error submitting enquiry:", error);
    return { error: "Failed to submit your inquiry. Please try again later." };
  }

  return { success: true };
}
