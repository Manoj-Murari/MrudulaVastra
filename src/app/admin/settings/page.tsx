import { getShippingSettings } from "@/actions/shipping";
import SettingsForm from "@/app/admin/settings/SettingsForm";

export const revalidate = 0;

export default async function SettingsPage() {
  const initialSettings = await getShippingSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
          Delivery Charges
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
          Configure delivery policies, shipping charges, and free delivery thresholds.
        </p>
      </div>

      <div className="max-w-xl">
        <SettingsForm initialSettings={initialSettings} />
      </div>
    </div>
  );
}
