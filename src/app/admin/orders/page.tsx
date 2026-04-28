import { getAdminOrders, getAdminProducts } from "@/actions/admin";
import OrdersTable from "./OrdersTable";

export const revalidate = 0;

export default async function OrdersPage() {
  const [orders, products] = await Promise.all([
    getAdminOrders(),
    getAdminProducts()
  ]);
  return <OrdersTable initialOrders={orders} products={products} />;
}
