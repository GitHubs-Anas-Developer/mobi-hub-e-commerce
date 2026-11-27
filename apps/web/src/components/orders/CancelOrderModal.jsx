"use client";

import { useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  ORDER_CANCELLATION_REASONS,
  formatCurrencyINR,
} from "@/components/orders/orderTimelineUtils";

export default function CancelOrderModal({
  order,
  open,
  loading = false,
  error = "",
  title = "Cancel Order",
  submitLabel = "Confirm Cancellation",
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState(ORDER_CANCELLATION_REASONS[0]);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState("");

  if (!open || !order) {
    return null;
  }

  const orderNumber = order.orderNumber || order._id || order.id;
  const isOnlinePaid =
    String(order.paymentMethod || "").toLowerCase() === "online" &&
    ["paid", "partiallyrefunded"].includes(
      String(order.paymentStatus || "").toLowerCase(),
    );
  const isCOD = String(order.paymentMethod || "").toUpperCase() === "COD";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const trimmedReason = String(reason || "").trim();
    const trimmedComment = String(comment || "").trim();

    if (!trimmedReason || trimmedReason.length < 3) {
      setValidationError("Please select a cancellation reason.");
      return;
    }

    if (trimmedReason === "Other" && trimmedComment.length < 3) {
      setValidationError(
        "Please add a brief explanation when selecting 'Other'.",
      );
      return;
    }

    setValidationError("");
    await onConfirm({
      orderId: order._id || order.id,
      reason: trimmedReason,
      comment: trimmedComment,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle size={21} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="cancel-order-modal-title"
                className="text-base font-extrabold text-[#101828]"
              >
                {title}
              </h2>
              <p className="text-xs font-medium text-[#64748B]">
                Order #{orderNumber} · {formatCurrencyINR(order.totalAmount)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            aria-label="Close cancellation dialog"
            className="rounded-lg p-1.5 text-[#64748B] transition hover:bg-white hover:text-[#101828] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="cancel-reason-select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]"
            >
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>

            <select
              id="cancel-reason-select"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setValidationError("");
              }}
              disabled={loading}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-medium text-[#101828] outline-none transition focus:border-[#0755E9] focus:ring-2 focus:ring-[#0755E9]/15"
            >
              {ORDER_CANCELLATION_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="cancel-comment-textarea"
                className="text-xs font-bold uppercase tracking-wider text-[#64748B]"
              >
                Additional Comments{" "}
                {reason === "Other" ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="font-medium normal-case">(Optional)</span>
                )}
              </label>
              <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
                {comment.length}/500
              </span>
            </div>

            <textarea
              id="cancel-comment-textarea"
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setValidationError("");
              }}
              disabled={loading}
              placeholder="Share any details to help us improve your shopping experience..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-slate-400 outline-none transition focus:border-[#0755E9] focus:ring-2 focus:ring-[#0755E9]/15"
            />
          </div>

          {/* Refund & Stock Policy Notice */}
          <div className="rounded-xl border border-[#0755E9]/20 bg-[#EFF6FF] p-3.5 text-xs leading-relaxed text-[#082B70]">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[#0755E9]"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-bold">Cancellation & Refund Policy</p>
                {isOnlinePaid ? (
                  <p>
                    Your paid amount of{" "}
                    <strong>{formatCurrencyINR(order.totalAmount)}</strong> will
                    be automatically refunded back to your original payment
                    method (Razorpay) upon cancellation.
                  </p>
                ) : isCOD ? (
                  <p>
                    This Cash on Delivery order has not been charged. Cancelling
                    immediately releases reserved inventory with no refund
                    needed.
                  </p>
                ) : (
                  <p>
                    No payment has been captured for this order yet. Cancelling
                    restores product stock immediately and cannot be undone.
                  </p>
                )}
              </div>
            </div>
          </div>

          {(validationError || error) && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#101828] transition hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Keep Order
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Cancelling Order...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

