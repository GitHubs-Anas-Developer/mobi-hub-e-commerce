
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import adminCouponService from "@/services/adminCouponService";
import CouponForm from "@/components/admin/coupons/CouponForm";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.couponId;

  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await adminCouponService.getCouponById(couponId);

        const data = response.data?.coupon;

        if (!data) {
          throw new Error("Coupon details not found.");
        }

        setCoupon(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load coupon.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (couponId) {
      fetchCoupon();
    }
  }, [couponId]);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError("");

      await adminCouponService.updateCoupon(
        couponId,
        formData,
      );

      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update coupon.",
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";

    const value = new Date(date);

    const localDate = new Date(
      value.getTime() - value.getTimezoneOffset() * 60000,
    );

    return localDate.toISOString().slice(0, 16);
  };

  const getInitialData = () => {
    if (!coupon) return undefined;

    return {
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "Percentage",
      discountValue: coupon.discountValue ?? "",
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxDiscountAmount: coupon.maxDiscountAmount ?? "",
      startDate: formatDateTime(coupon.startDate),
      expiryDate: formatDateTime(coupon.expiryDate),
      usageLimit: coupon.usageLimit ?? "",
      perUserLimit: coupon.perUserLimit ?? 1,
    };
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
            Edit Coupon
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update coupon details and discount settings.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading coupon details...
          </div>
        ) : error && !coupon ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : coupon ? (
          <>
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <CouponForm
              key={coupon._id}
              initialData={getInitialData()}
              loading={saving}
              onSubmit={handleSubmit}
              onCancel={() => router.push("/admin/coupons")}
              submitLabel="Update Coupon"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
