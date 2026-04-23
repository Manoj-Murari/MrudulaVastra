import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin | Enquiries - Mrudula Vastra",
};

export default async function EnquiriesPage() {
  const supabase = await createClient();

  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-playfair text-forest">Customer Enquiries</h1>
        <p className="text-text-muted mt-1 font-dm text-sm">
          View and manage inquiries sent through the Contact form.
        </p>
      </div>

      <div className="bg-white shadow-sm border border-gold/20 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 font-dm">
            Error loading enquiries. Please ensure the enquiries table exists in Supabase.
          </div>
        ) : !enquiries || enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted font-dm">No inquiries received yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-dm text-sm">
              <thead className="bg-forest/5 text-forest font-medium border-b border-gold/20">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {enquiries.map((enq: any) => (
                  <tr key={enq.id} className="hover:bg-forest/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted">
                      {new Date(enq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-forest">{enq.name}</div>
                      <div className="text-xs text-text-muted">{enq.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-forest">
                      {enq.subject || "No Subject"}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-text-muted truncate" title={enq.message}>
                        {enq.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                          enq.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
