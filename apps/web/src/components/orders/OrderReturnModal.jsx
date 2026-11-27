"use client";

import { useState } from "react";
import { X, RotateCcw, LoaderCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/lib/axios";
import {
  RETURN_REASONS,
  formatCurrencyINR,
  getOrderThumbnailUrl,
} from "@/components/orders/orderTimelineUtils";

export default function OrderReturnModal({
  order,
  open,
  onClose,
  onSuccess,
}) {
  const items = Array.isArray(order?.items) ? order.items : [];

  const [selectedMap, setSelectedMap] = useState(() => {
    const initial = {};
    items.forEach((item, index) => {
      const key = `${item.product}_${item.variantId}_${index}`;
      initial[key] = {
        selected: items.length === 1,
        quantity: Number(item.quantity) || 1,
      };
    });
    return initial;
  });

  const [reason, setReason] = useState(RETURN_REASONS[0].value);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedReturn, setSubmittedReturn] = useState(null);

  if (!open || !order) return null;

  const toggleItem = (key) => {
    setError("");
    setSelectedMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        selected: !prev[key]?.selected,
      },
    }));
  };

  const updateQuantity = (key, maxQty, nextQty) => {
    const parsed = Math.max(1, Math.min(maxQty, Number(nextQty) || 1));
    setSelectedMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: parsed,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const selectedItems = items
      .map((item, index) => {
        const key = `${item.product}_${item.variantId}_${index}`;
        const entry = selectedMap[key];
        if (!entry?.selected) return null;

        return {
          productId: String(item.product?._id || item.product || ""),
          variantId: String(item.variantId || ""),
          quantity: Number(entry.quantity) || 1,
        };
      })
      .filter(Boolean);

    if (selectedItems.length === 0) {
      setError("Please select at least one item to return.");
      return;
    }

    if (selectedItems.some((item) => !item.productId || !item.variantId)) {
      setError("Item identifier is missing. Please contact support.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/returns", {
        orderId: order._id,
        reason,
        description: description.trim(),
        items: selectedItems,
      });

      const createdReturn = response?.data?.data?.return || null;
      setSubmittedReturn(createdReturn);
      toast.success("Return request submitted.");
      if (onSuccess) onSuccess(createdReturn);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit return request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#101828]/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#E2E8F0] bg-white shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <RotateCcw size={18} />
            </div>
            <div>
              <h2
                id="return-modal-title"
                className="text-base font-extrabold text-[#101828]"
              >
                Request Order Return
              </h2>
              <p className="text-xs text-[#64748B]">
                Order #{order.orderNumber || order._id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close return dialog"
            className="rounded-lg p-1.5 text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#101828]"
          >
            <X size={18} />
          </button>
        </div>

        {submittedReturn ? (
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Return request submitted
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Your return request has been registered and will be reviewed by
                  our team.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#64748B]">Return Number</span>
                <span className="font-bold text-[#101828]">
                  {submittedReturn.returnNumber}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#64748B]">Status</span>
                <span className="font-bold text-[#0755E9]">
                  {submittedReturn.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#64748B]">Eligible Refund Amount</span>
                <span className="font-extrabold text-[#101828]">
                  {formatCurrencyINR(submittedReturn.refundAmount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Select Items
              </p>

              <div className="space-y-2.5">
                {items.map((item, index) => {
                  const key = `${item.product}_${item.variantId}_${index}`;
                  const state = selectedMap[key] || {
                    selected: false,
                    quantity: 1,
                  };
                  const maxQty = Number(item.quantity) || 1;
                  const thumb = getOrderThumbnailUrl(item.thumbnail);

                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                        state.selected
                          ? "border-[#0755E9]/40 bg-[#EFF6FF]/50"
                          : "border-[#E2E8F0] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(state.selected)}
                        onChange={() => toggleItem(key)}
                        aria-label={`Select ${item.productName} for return`}
                        className="h-4 w-4 shrink-0 rounded border-[#E2E8F0] accent-[#0755E9]"
                      />

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={item.productName || "Product"}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <RotateCcw size={16} className="text-[#64748B]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#101828]">
                          {item.productName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          Ordered: {maxQty} · {formatCurrencyINR(item.sellingPrice)}
                        </p>
                      </div>

                      {state.selected && maxQty > 1 && (
                        <div className="flex items-center gap-1.5">
                          <label
                            htmlFor={`ret-qty-${index}`}
                            className="text-[11px] font-semibold text-[#64748B]"
                          >
                            Qty
                          </label>
                          <select
                            id={`ret-qty-${index}`}
                            value={state.quantity}
                            onChange={(e) =>
                              updateQuantity(key, maxQty, e.target.value)
                            }
                            className="h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs font-bold text-[#101828]"
                          >
                            {Array.from(
                              { length: maxQty },
                              (_, idx) => idx + 1
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="return-reason"
                className="mb-1.5 block text-xs font-bold text-[#101828]"
              >
                Reason for Return
              </label>
              <select
                id="return-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#101828] outline-none transition focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15"
              >
                {RETURN_REASONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="return-notes"
                className="mb-1.5 block text-xs font-bold text-[#101828]"
              >
                Additional Details{" "}
                <span className="font-normal text-[#64748B]">(Optional)</span>
              </label>
              <textarea
                id="return-notes"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                placeholder="Describe the issue briefly (up to 500 characters)..."
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#101828] outline-none transition focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2.5 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-bold text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#101828]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Return Request"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

