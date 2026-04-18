import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--admin-accent-glow)" }}
      >
        <BarChart3 size={28} style={{ color: "var(--admin-accent)" }} />
      </div>
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}
      >
        Advanced Analytics
      </h1>
      <p
        className="text-[13px] max-w-md text-center"
        style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}
      >
        Cohort analysis, customer retention curves, and advanced revenue attribution are coming soon. The Overview dashboard provides real-time business intelligence.
      </p>
    </div>
  );
}
