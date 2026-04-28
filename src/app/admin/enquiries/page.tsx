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
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
          Customer Enquiries
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
          View and manage inquiries sent through the Contact form.
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
        {error ? (
          <div className="p-8 text-center text-red-500 font-dm">
            Error loading enquiries. Please ensure the enquiries table exists in Supabase.
          </div>
        ) : !enquiries || enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[13px]" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
              No inquiries received yet.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {enquiries.map((enq: any) => (
                <div key={enq.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}>{enq.name}</div>
                      <div className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>{enq.email}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-full ${
                        enq.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--admin-text-muted)" }}>{enq.subject || "No Subject"}</div>
                    <p className="text-[13px] line-clamp-3" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>{enq.message}</p>
                  </div>
                  <div className="text-[10px] text-right" style={{ color: "var(--admin-text-muted)" }}>
                    {new Date(enq.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto admin-scroll">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] uppercase tracking-[0.2em] font-bold" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-dim)", background: "var(--admin-surface-elevated)", fontFamily: "'DM Sans', sans-serif" }}>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[13px]" style={{ borderColor: "var(--admin-border)", fontFamily: "'DM Sans', sans-serif" }}>
                  {enquiries.map((enq: any) => (
                    <tr key={enq.id} className="transition-colors duration-150" onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: "var(--admin-text-muted)" }}>
                        {new Date(enq.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold" style={{ color: "var(--admin-text)" }}>{enq.name}</div>
                        <div className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>{enq.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold" style={{ color: "var(--admin-text)" }}>
                        {enq.subject || "No Subject"}
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="truncate" style={{ color: "var(--admin-text-dim)" }} title={enq.message}>
                          {enq.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                            enq.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
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
          </>
        )}
      </div>
    </div>
  );
}
