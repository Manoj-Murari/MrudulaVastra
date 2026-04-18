import { getAdminOverview } from "@/actions/admin";
import OverviewDashboard from "./OverviewDashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const data = await getAdminOverview();
  return <OverviewDashboard data={data} />;
}
