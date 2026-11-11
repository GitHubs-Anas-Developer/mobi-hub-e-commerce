
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/coupons")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Coupons
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Create Coupon
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new discount coupon for MOBI HUB customers.
          </p>
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
