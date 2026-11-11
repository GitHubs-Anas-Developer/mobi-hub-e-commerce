
"use client";

import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";

const initialFormData = {
  code: "",
  description: "",
  discountType: "Percentage",
  discountValue: "",
  minOrderAmount: 0,
  maxDiscountAmount: "",
  startDate: "",
  expiryDate: "",
  usageLimit: "",
  perUserLimit: 1,
};

export default function CouponForm({
  initialData = initialFormData,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel = "Create Coupon",

}) {
  const [formData, setFormData] = useState({
    ...initialFormData,
    ...initialData,
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      startDate,
      expiryDate,
      perUserLimit,
      maxDiscountAmount,
      usageLimit,
    } = formData;

    if (!code.trim()) return "Coupon code is required.";

    if (!/^[A-Za-z0-9_-]{3,30}$/.test(code.trim())) {
      return "Coupon code must be 3–30 characters and contain only letters, numbers, _ or -.";
    }

    if (!["Percentage", "Fixed"].includes(discountType)) {
      return "Please select a valid discount type.";
    }

    if (
      discountValue === "" ||
      !Number.isFinite(Number(discountValue)) ||
      Number(discountValue) <= 0
    ) {
      return "Enter a valid discount value.";
    }

    if (
      discountType === "Percentage" &&
      Number(discountValue) > 100
    ) {
      return "Percentage discount cannot exceed 100.";
    }

    if (
      minOrderAmount === "" ||
      !Number.isFinite(Number(minOrderAmount)) ||
      Number(minOrderAmount) < 0
    ) {
      return "Enter a valid minimum order amount.";
    }

    if (
      maxDiscountAmount !== "" &&
      (!Number.isFinite(Number(maxDiscountAmount)) ||
        Number(maxDiscountAmount) <= 0)
    ) {
      return "Maximum discount amount must be positive.";
    }

    if (!startDate || !expiryDate) {
      return "Start date and expiry date are required.";
    }

    if (new Date(expiryDate) <= new Date(startDate)) {
      return "Expiry date must be after start date.";
    }

    if (
      usageLimit !== "" &&
      (!Number.isInteger(Number(usageLimit)) ||
        Number(usageLimit) <= 0)
    ) {
      return "Usage limit must be a positive whole number.";
    }

    if (
      !Number.isInteger(Number(perUserLimit)) ||
      Number(perUserLimit) <= 0
    ) {
      return "Per-user limit must be a positive whole number.";
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscountAmount:
        formData.maxDiscountAmount === ""
          ? null
          : Number(formData.maxDiscountAmount),
      startDate: new Date(formData.startDate).toISOString(),
      expiryDate: new Date(formData.expiryDate).toISOString(),
      usageLimit:
        formData.usageLimit === ""
          ? null
          : Number(formData.usageLimit),
      perUserLimit: Number(formData.perUserLimit),
    };

    onSubmit(payload);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Basic Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter the coupon code and its description.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="code" className={labelClass}>
              Coupon Code *
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. SAVE20"
              maxLength={30}
              required
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-400">
              3–30 characters. Letters, numbers, _ and - only.
            </p>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>

            <input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter coupon description"
              maxLength={300}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Discount Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Discount Details
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="discountType" className={labelClass}>
              Discount Type *
            </label>

            <select
              id="discountType"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Percentage">Percentage (%)</option>
              <option value="Fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div>
            <label htmlFor="discountValue" className={labelClass}>
              Discount Value *
            </label>

            <input
              id="discountValue"
              name="discountValue"
              type="number"
              min="0.01"
              max={
                formData.discountType === "Percentage"
                  ? 100
                  : undefined
              }
              step="0.01"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder="Enter discount value"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="minOrderAmount" className={labelClass}>
              Minimum Order Amount (₹) *
            </label>

            <input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.minOrderAmount}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {formData.discountType === "Percentage" && (
            <div>
              <label
                htmlFor="maxDiscountAmount"
                className={labelClass}
              >
                Maximum Discount Amount (₹)
              </label>

              <input
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="No maximum limit"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </section>

      {/* Validity */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Coupon Validity
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className={labelClass}>
              Start Date *
            </label>

            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className={labelClass}>
              Expiry Date *
            </label>

            <input
              id="expiryDate"
              name="expiryDate"
              type="datetime-local"
              value={formData.expiryDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Usage Limits */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Usage Limits
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="usageLimit" className={labelClass}>
              Total Usage Limit
            </label>

            <input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              step="1"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Unlimited"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="perUserLimit" className={labelClass}>
              Per User Limit *
            </label>

            <input
              id="perUserLimit"
              name="perUserLimit"
              type="number"
              min="1"
              step="1"
              value={formData.perUserLimit}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {loading ? "Saving..." : "Create Coupon"}        </button>
      </div>
    </form>
  );
}
