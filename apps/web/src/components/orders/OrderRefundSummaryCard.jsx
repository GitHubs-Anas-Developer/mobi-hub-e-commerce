"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import {
  formatCurrencyINR,
  formatDateTime,
  getRefundStatusMeta,
} from "@/components/orders/orderTimelineUtils";

export default function OrderRefundSummaryCard({ order }) {
  if (!order) return null;

  const isCancelled =
    String(order.orderStatus || "").toLowerCase() === "cancelled";
  const summary = order.refundSummary || {};
  const refundStatus = summary.status || order.refundStatus || "NOT_REQUIRED";

  if (!isCancelled && refundStatus === "NOT_REQUIRED") {
    return null;
  }

  const meta = getRefundStatusMeta(
    refundStatus,
    order.paymentStatus,
    order.paymentMethod,
  );
  const refundAmount = Number(summary.amount ?? order.refundAmount ?? 0);
  const gatewayRefundId = summary.gatewayRefundId || null;
  const requestedAt = summary.requestedAt || order.refundRequestedAt;
  const processedAt = summary.processedAt || order.refundCompletedAt;
  const failureReason = summary.failureReason || order.refundFailureReason;

  const StatusIcon =
    meta.tone === "success"
      ? CheckCircle2
      : meta.tone === "processing"
        ? LoaderCircle
        : meta.tone === "failed" || meta.tone === "warning"
          ? AlertCircle
          : Clock3;

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <RotateCcw size={19} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#101828] sm:text-lg">
              Cancellation & Refund Status
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Recorded cancellation metadata and gateway refund settlement
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${meta.badgeClasses}`}
        >
          <StatusIcon
            size={13}
            className={meta.tone === "processing" ? "animate-spin" : ""}
            aria-hidden="true"
          />
          {meta.label}
        </span>
      </div>

      {/* Cancellation Metadata */}
      {isCancelled && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Cancellation Reason
            </p>
            <p className="mt-1 text-sm font-bold text-[#101828]">
              {order.cancellationReason || "Order cancelled"}
            </p>
            {order.cancellationComment && (
              <p className="mt-1 text-xs text-[#64748B]">
                &ldquo;{order.cancellationComment}&rdquo;
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Cancelled On
            </p>
            <p className="mt-1 text-sm font-bold text-[#101828]">
              {formatDateTime(order.cancelledAt) || "N/A"}
            </p>
            {order.cancelledBy && (
              <p className="mt-0.5 text-xs text-[#64748B]">
                Initiated by{" "}
                <span className="font-semibold text-[#101828]">
                  {order.cancelledBy === "ADMIN" ? "ELENZO Support" : "Customer"}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Refund Status Description */}
      <p className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
        {meta.description}
      </p>

      {/* Refund Breakdown */}
      {(refundAmount > 0 || gatewayRefundId || requestedAt || processedAt) && (
        <div className="mt-4 space-y-2.5 rounded-xl border border-[#E2E8F0] bg-white p-4 text-sm">
          {refundAmount > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#64748B]">Refund Amount</span>
              <span className="text-base font-extrabold text-[#0755E9] tabular-nums">
                {formatCurrencyINR(refundAmount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B]">Refund Method</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#101828]">
              <CreditCard size={14} className="text-[#0755E9]" />
              {summary.method === "Razorpay"
                ? "Razorpay (Original Payment Method)"
                : summary.method === "Manual"
                  ? "Manual Bank / Cash Transfer"
                  : order.paymentMethod || "N/A"}
            </span>
          </div>

          {gatewayRefundId && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#64748B]">Refund Reference ID</span>
              <span className="break-all font-mono text-xs font-bold text-[#101828]">
                {gatewayRefundId}
              </span>
            </div>
          )}

          {requestedAt && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#64748B]">Initiated At</span>
              <span className="font-semibold text-[#101828]">
                {formatDateTime(requestedAt)}
              </span>
            </div>
          )}

          {processedAt && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#64748B]">Completed At</span>
              <span className="font-semibold text-emerald-700">
                {formatDateTime(processedAt)}
              </span>
            </div>
          )}
        </div>
      )}

      {failureReason &&
        ["FAILED", "RECONCILIATION_REQUIRED"].includes(refundStatus) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
            Note: {failureReason}
          </div>
        )}
    </section>
  );
}

