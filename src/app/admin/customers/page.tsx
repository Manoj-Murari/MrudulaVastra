import { getAdminCustomers } from "@/actions/admin";
import CustomerCRM from "./CustomerCRM";

export const revalidate = 0;

export default async function CustomersPage() {
  const customers = await getAdminCustomers();
  return <CustomerCRM initialCustomers={customers} />;
}
