import { getAdminOrders } from "@/actions/admin";
import OrdersTable from "./OrdersTable";

export const revalidate = 0;

export default async function OrdersPage() {
  const orders = await getAdminOrders();
  return <OrdersTable initialOrders={orders} />;
}
