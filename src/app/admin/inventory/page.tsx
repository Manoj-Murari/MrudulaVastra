import { getAdminProducts } from "@/actions/admin";
import InventoryMatrix from "./InventoryMatrix";

export const revalidate = 0;

export default async function InventoryPage() {
  const products = await getAdminProducts();
  return <InventoryMatrix initialProducts={products} />;
}
