import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data } = await supabase.from('orders').select('id, status, customer_email').order('created_at', { ascending: false }).limit(3);
  console.log(data);
}
run();
