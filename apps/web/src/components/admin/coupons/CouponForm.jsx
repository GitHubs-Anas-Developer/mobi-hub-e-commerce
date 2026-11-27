"use client";

import { useState } from "react";
import { Alert, Button, Card, Input, InputNumber, Select } from "antd";
import {
  CalendarClock,
  Percent,
  Save,
  Tag as TagIcon,
  Users,
} from "lucide-react";

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

const fieldLabelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#475569]";

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

  const [validationError, setValidationError] = useState("");

  const setField = (name, value) => {
    setValidationError("");

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: name === "code" ? String(value || "").toUpperCase() : value,
      };

      if (name === "discountType" && value === "Fixed") {
        updated.maxDiscountAmount = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    const trimmedCode = formData.code.trim().toUpperCase();

    if (!trimmedCode) {
      setValidationError("Coupon code is required");
      return;
    }

    if (!/^[A-Za-z0-9_-]{3,30}$/.test(trimmedCode)) {
      setValidationError(
        "Coupon code must be 3 to 30 characters and contain only letters, numbers, hyphens, or underscores.",
      );
      return;
    }

    const discountValue = Number(formData.discountValue);

    if (
      formData.discountValue === "" ||
      Number.isNaN(discountValue) ||
      discountValue <= 0
    ) {
      setValidationError("Discount value must be greater than 0.");
      return;
    }

    if (formData.discountType === "Percentage" && discountValue > 100) {
      setValidationError("Percentage discount cannot exceed 100%.");
      return;
    }

    const minOrderAmount = Number(formData.minOrderAmount);

    if (Number.isNaN(minOrderAmount) || minOrderAmount < 0) {
      setValidationError("Minimum order amount cannot be negative.");
      return;
    }

    if (
      formData.discountType === "Percentage" &&
      formData.maxDiscountAmount !== "" &&
      formData.maxDiscountAmount !== null &&
      Number(formData.maxDiscountAmount) <= 0
    ) {
      setValidationError("Maximum discount amount must be greater than 0.");
      return;
    }

    if (!formData.startDate || !formData.expiryDate) {
      setValidationError("Start date and expiry date are required.");
      return;
    }

    const start = new Date(formData.startDate);
    const expiry = new Date(formData.expiryDate);

    if (expiry <= start) {
      setValidationError("Expiry date must be later than start date.");
      return;
    }

    if (formData.usageLimit !== "" && formData.usageLimit !== null) {
      const usageLimit = Number(formData.usageLimit);

      if (!Number.isInteger(usageLimit) || usageLimit < 1) {
        setValidationError("Usage limit must be a whole number at least 1.");
        return;
      }
    }

    const perUserLimit = Number(formData.perUserLimit);

    if (!Number.isInteger(perUserLimit) || perUserLimit < 1) {
      setValidationError("Per user limit must be a whole number at least 1.");
      return;
    }

    const payload = {
      code: trimmedCode,
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount:
        formData.maxDiscountAmount === "" ||
        formData.maxDiscountAmount === null
          ? null
          : Number(formData.maxDiscountAmount),
      startDate: start.toISOString(),
      expiryDate: expiry.toISOString(),
      usageLimit:
        formData.usageLimit === "" || formData.usageLimit === null
          ? null
          : Number(formData.usageLimit),
      perUserLimit,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {validationError && (
        <Alert
          type="error"
          showIcon
          title="Validation Error"
          description={validationError}
          closable
          onClose={() => setValidationError("")}
        />
      )}

      {/* Basic Details */}
      <Card
        title={
          <span className="flex items-center gap-2 text-base font-semibold text-[#101828]">
            <TagIcon size={17} className="text-[#0755E9]" />
            Coupon Details
          </span>
        }
        className="border-[#E2E8F0] shadow-xs"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="code" className={fieldLabelClass}>
              Coupon Code *
            </label>

            <Input
              id="code"
              name="code"
              size="large"
              value={formData.code}
              onChange={(event) => setField("code", event.target.value)}
              placeholder="e.g. SAVE20"
              maxLength={30}
              className="font-mono font-semibold uppercase"
            />
          </div>

          <div>
            <label htmlFor="description" className={fieldLabelClass}>
              Description
            </label>

            <Input
              id="description"
              name="description"
              size="large"
              value={formData.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Enter coupon description"
              maxLength={300}
            />
          </div>
        </div>
      </Card>

      {/* Discount Details */}
      <Card
        title={
          <span className="flex items-center gap-2 text-base font-semibold text-[#101828]">
            <Percent size={17} className="text-[#0755E9]" />
            Discount Details
          </span>
        }
        className="border-[#E2E8F0] shadow-xs"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="discountType" className={fieldLabelClass}>
              Discount Type *
            </label>

            <Select
              id="discountType"
              size="large"
              value={formData.discountType}
              onChange={(value) => setField("discountType", value)}
              className="w-full"
              options={[
                { label: "Percentage (%)", value: "Percentage" },
                { label: "Fixed Amount (₹)", value: "Fixed" },
              ]}
            />
          </div>

          <div>
            <label htmlFor="discountValue" className={fieldLabelClass}>
              Discount Value *
            </label>

            <InputNumber
              id="discountValue"
              name="discountValue"
              size="large"
              min={0.01}
              max={formData.discountType === "Percentage" ? 100 : undefined}
              step={0.01}
              value={
                formData.discountValue === "" ? null : Number(formData.discountValue)
              }
              onChange={(value) =>
                setField("discountValue", value === null ? "" : value)
              }
              placeholder="Enter discount value"
              className="!w-full"
            />
          </div>

          <div>
            <label htmlFor="minOrderAmount" className={fieldLabelClass}>
              Minimum Order Amount (₹) *
            </label>

            <InputNumber
              id="minOrderAmount"
              name="minOrderAmount"
              size="large"
              min={0}
              step={0.01}
              value={
                formData.minOrderAmount === ""
                  ? null
                  : Number(formData.minOrderAmount)
              }
              onChange={(value) =>
                setField("minOrderAmount", value === null ? 0 : value)
              }
              className="!w-full"
            />
          </div>

          {formData.discountType === "Percentage" && (
            <div>
              <label htmlFor="maxDiscountAmount" className={fieldLabelClass}>
                Maximum Discount Amount (₹)
              </label>

              <InputNumber
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                size="large"
                min={0.01}
                step={0.01}
                value={
                  formData.maxDiscountAmount === "" ||
                  formData.maxDiscountAmount === null
                    ? null
                    : Number(formData.maxDiscountAmount)
                }
                onChange={(value) =>
                  setField("maxDiscountAmount", value === null ? "" : value)
                }
                placeholder="No maximum limit"
                className="!w-full"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Validity */}
      <Card
        title={
          <span className="flex items-center gap-2 text-base font-semibold text-[#101828]">
            <CalendarClock size={17} className="text-[#0755E9]" />
            Coupon Validity
          </span>
        }
        className="border-[#E2E8F0] shadow-xs"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className={fieldLabelClass}>
              Start Date *
            </label>

            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              size="large"
              value={formData.startDate}
              onChange={(event) => setField("startDate", event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className={fieldLabelClass}>
              Expiry Date *
            </label>

            <Input
              id="expiryDate"
              name="expiryDate"
              type="datetime-local"
              size="large"
              value={formData.expiryDate}
              onChange={(event) => setField("expiryDate", event.target.value)}
              required
            />
          </div>
        </div>
      </Card>

      {/* Usage Limits */}
      <Card
        title={
          <span className="flex items-center gap-2 text-base font-semibold text-[#101828]">
            <Users size={17} className="text-[#0755E9]" />
            Usage Limits
          </span>
        }
        className="border-[#E2E8F0] shadow-xs"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="usageLimit" className={fieldLabelClass}>
              Total Usage Limit
            </label>

            <InputNumber
              id="usageLimit"
              name="usageLimit"
              size="large"
              min={1}
              step={1}
              precision={0}
              value={
                formData.usageLimit === "" || formData.usageLimit === null
                  ? null
                  : Number(formData.usageLimit)
              }
              onChange={(value) =>
                setField("usageLimit", value === null ? "" : value)
              }
              placeholder="Unlimited"
              className="!w-full"
            />
          </div>

          <div>
            <label htmlFor="perUserLimit" className={fieldLabelClass}>
              Per User Limit *
            </label>

            <InputNumber
              id="perUserLimit"
              name="perUserLimit"
              size="large"
              min={1}
              step={1}
              precision={0}
              value={
                formData.perUserLimit === "" ? null : Number(formData.perUserLimit)
              }
              onChange={(value) =>
                setField("perUserLimit", value === null ? 1 : value)
              }
              className="!w-full"
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse justify-end gap-3 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-xs sm:flex-row">
        <Button size="large" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          icon={<Save size={16} />}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
