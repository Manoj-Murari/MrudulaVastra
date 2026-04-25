import { getCoupons } from "@/actions/coupons";
import CouponManager from "./CouponManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="max-w-5xl mx-auto">
      <CouponManager initialCoupons={coupons} />
    </div>
  );
}
