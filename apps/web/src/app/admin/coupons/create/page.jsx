
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TicketPercent } from "lucide-react";

import adminCouponService from "@/services/adminCouponService";
import CouponForm from "@/components/admin/coupons/CouponForm";

export default function CreateCouponPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError("");

      await adminCouponService.createCoupon(formData);

      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to create coupon. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-end">
          <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#101828]">
            <TicketPercent className="text-[#0755E9]" size={24} aria-hidden="true" />
            Create New Coupon
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Create a new discount coupon for ELENZO customers.
          </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/coupons")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#101828] transition hover:border-[#0755E9]/40 hover:text-[#0755E9]"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back to Coupons
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <CouponForm
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/coupons")}
        />
      </div>
    </div>
  );
}
