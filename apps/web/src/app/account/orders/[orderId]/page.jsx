"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ReceiptText,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  XCircle,
  Mail,
  Phone,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Breadcrumb from "@/components/common/Breadcrumb";
import OrderDetailsSkeleton from "@/components/loading/skeletons/OrderDetailsSkeleton";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";
import OrderReturnModal from "@/components/orders/OrderReturnModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import OrderRefundSummaryCard from "@/components/orders/OrderRefundSummaryCard";
import { BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";
import {
  canCancelOrder,
  formatCurrencyINR,
  formatDateShort,
  formatDateTime,
  formatLabelText,
  getOrderStatusBadgeClasses,
  getOrderThumbnailUrl,
  getReturnEligibility,
  getVariantAttributes,
  resolveOrderTimeline,
} from "@/components/orders/orderTimelineUtils";
import {
  clearCancelError,
  clearSelectedOrder,
  selectCancellingOrderId,
  selectOrderCancelError,
  selectOrderDetailsError,
  selectOrderDetailsLoading,
  selectOrderDetailsStatusCode,
  selectSelectedOrder,
} from "@/store/slices/orderSlice";
import {
  cancelUserOrder,
  fetchUserOrderById,
} from "@/store/thunks/orderThunks";

function StatusPill({ children, status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${getOrderStatusBadgeClasses(
        status || children
      )}`}
    >
      {children || "Pending"}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, subtitle, rightSlot = null }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
          <Icon size={19} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold tracking-tight text-[#101828] sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p>
          )}
        </div>
      </div>
      {rightSlot}
    </div>
  );
}

function InfoCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[#64748B]">{label}</span>
      <span className={`text-right font-semibold text-[#101828] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function OrderProductImageInner({ src, alt }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = imgRef.current;
    if (element && element.complete && element.naturalWidth > 0) {
      queueMicrotask(() => setLoaded(true));
    }
  }, []);

  if (!src || failed) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] sm:h-28 sm:w-28">
        <Package size={28} className="text-[#64748B]/50" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] sm:h-28 sm:w-28">
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-slate-200"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-contain p-2 transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function OrderProductImage({ src, alt }) {
  return <OrderProductImageInner key={src || "fallback"} src={src} alt={alt} />;
}

function OrderDetailsContent() {
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const dispatch = useDispatch();

  const order = useSelector(selectSelectedOrder);
  const loading = useSelector(selectOrderDetailsLoading);
  const detailsError = useSelector(selectOrderDetailsError);
  const detailsStatusCode = useSelector(selectOrderDetailsStatusCode);
  const cancellingOrderId = useSelector(selectCancellingOrderId);
  const cancelError = useSelector(selectOrderCancelError);

  const [refreshing, setRefreshing] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [submittedReturn, setSubmittedReturn] = useState(null);

  const error = !orderId ? "Order ID is missing from the URL." : detailsError;
  const isNotFound = detailsStatusCode === 404;

  const fetchOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!orderId) return;
      if (silent) setRefreshing(true);
      try {
        await dispatch(fetchUserOrderById({ orderId, silent })).unwrap();
      } catch {
        // Error captured safely in Redux state
      } finally {
        if (silent) setRefreshing(false);
      }
    },
    [orderId, dispatch],
  );

  useEffect(() => {
    if (!orderId) return undefined;
    dispatch(fetchUserOrderById({ orderId, silent: false }));
    return () => {
      dispatch(clearSelectedOrder());
      dispatch(clearCancelError());
    };
  }, [orderId, dispatch]);

  const timeline = useMemo(() => {
    if (!order) return null;
    return resolveOrderTimeline({
      orderStatus: order.orderStatus,
      orderStatusHistory: order.orderStatusHistory,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      shipment: order.shipment || {},
    });
  }, [order]);

  const handleCopyOrderNumber = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedOrderNumber(true);
      toast.success("Order number copied.");
      setTimeout(() => setCopiedOrderNumber(false), 1800);
    } catch {
      toast.error("Unable to copy order number.");
    }
  };

  const handleConfirmCancel = async ({ orderId: targetId, reason, comment }) => {
    if (!targetId || cancellingOrderId) return;

    try {
      await dispatch(
        cancelUserOrder({ orderId: targetId, reason, comment }),
      ).unwrap();
      toast.success("Order cancelled successfully.");
      setShowCancelModal(false);
      dispatch(clearCancelError());
    } catch {
      // Inline cancelError rendered inside CancelOrderModal
    }
  };

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
          {isNotFound ? <Package size={30} /> : <AlertCircle size={30} />}
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-[#101828]">
          {isNotFound ? "Order not found" : "Unable to load order"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          {error ||
            "We could not locate this order under your account."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!isNotFound && (
            <button
              type="button"
              onClick={() => fetchOrder()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}

          <Link
            href="/account/orders"
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
              isNotFound
                ? "bg-[#0755E9] text-white hover:bg-[#0645C4]"
                : "border border-[#E2E8F0] bg-white text-[#101828] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
            }`}
          >
            <ArrowLeft size={16} />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || order._id;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0
  );
  const address = order.shippingAddress || {};
  const shipment = order.shipment || {};
  const hasShipmentTracking = Boolean(
    shipment?.shipmentId || shipment?.awbCode
  );

  const isCOD = String(order.paymentMethod || "").toUpperCase() === "COD";
  const paymentStatusLower = String(order.paymentStatus || "").toLowerCase();
  const isPaid = paymentStatusLower === "paid";
  const isRefunded = ["refunded", "partiallyrefunded"].includes(
    paymentStatusLower
  );
  const isPaymentFailed = paymentStatusLower === "failed";
  const isCancelled =
    String(order.orderStatus || "").toLowerCase() === "cancelled";

  const canCancel = canCancelOrder(order);
  const returnEligibility = getReturnEligibility(order);

  const discountAmount = Number(
    order.discount ?? order.coupon?.discountAmount ?? 0
  );
  const couponCode = order.coupon?.code || "";
  const shippingFee = Number(order.shippingFee ?? 0);
  const taxAmount = Number(order.tax ?? 0);
  const transactionReference =
    order.paymentSummary?.razorpayPaymentId ||
    order.paymentDetails?.transactionId ||
    order.transactionId ||
    order.paymentId ||
    "";

  const supportSubject = encodeURIComponent(
    `${BRAND_NAME} Order Support - #${orderNumber}`
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5 sm:space-y-6">
      <Breadcrumb
        items={[
          { label: "My Account", href: "/account" },
          { label: "My Orders", href: "/account/orders" },
          { label: `#${orderNumber}` },
        ]}
      />

      {/* Top Title & Action Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/account/orders"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] transition hover:text-[#0755E9]"
          >
            <ArrowLeft size={14} />
            Back to My Orders
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
            Order Details
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Complete item breakdown, payment summary, delivery address, and
            shipment updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchOrder({ silent: true })}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-[#0755E9]" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {hasShipmentTracking && (
            <Link
              href={`/account/orders/${order._id}/tracking`}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:flex-initial"
            >
              <Truck size={15} />
              Track Shipment
            </Link>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => {
                dispatch(clearCancelError());
                setShowCancelModal(true);
              }}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-700 transition hover:bg-red-100 sm:flex-initial"
            >
              <XCircle size={15} />
              Cancel Order
            </button>
          )}

          {returnEligibility.eligible && (
            <button
              type="button"
              onClick={() => setShowReturnModal(true)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#0755E9]/30 bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white sm:flex-initial"
            >
              <RotateCcw size={14} />
              Request Return
            </button>
          )}
        </div>
      </div>

      {/* Newly Submitted Return Banner */}
      {submittedReturn && (
        <section className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-sm font-extrabold text-emerald-900">
                Return Request Submitted ({submittedReturn.returnNumber})
              </p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Status: {submittedReturn.status} · Refund Amount:{" "}
                {formatCurrencyINR(submittedReturn.refundAmount)} (
                {submittedReturn.refundMethod})
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Terminal Cancelled / Exception Banner */}
      {timeline?.terminal?.isTerminal && (
        <section
          className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${
            timeline.terminal.kind === "returned"
              ? "border-orange-200 bg-orange-50 text-orange-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-extrabold">
              Order {timeline.terminal.label}
            </p>
            <p className="text-xs leading-5 opacity-90">
              {timeline.terminalNote ||
                "This order has reached a terminal status."}
              {timeline.terminalTimestamp
                ? ` · ${formatDateTime(timeline.terminalTimestamp)}`
                : ""}
            </p>
            {isRefunded && (
              <p className="text-xs font-bold">
                Refund status: {formatLabelText(order.paymentStatus)}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Cancellation & Refund Tracking Breakdown */}
      <OrderRefundSummaryCard order={order} />

      {/* Order Summary Header Card */}
      <InfoCard className="overflow-hidden !p-0">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#0755E9] sm:h-14 sm:w-14">
              <Package size={24} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                Order Number
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="break-all text-lg font-extrabold text-[#101828] sm:text-xl">
                  #{orderNumber}
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopyOrderNumber(orderNumber)}
                  aria-label="Copy order number"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] font-semibold text-[#64748B] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                >
                  {copiedOrderNumber ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                Placed on {formatDateTime(order.createdAt) || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5">
              <span className="text-xs font-medium text-[#64748B]">Order</span>
              <StatusPill status={order.orderStatus}>
                {order.orderStatus || "Pending"}
              </StatusPill>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5">
              <span className="text-xs font-medium text-[#64748B]">
                Payment
              </span>
              <StatusPill status={order.paymentStatus}>
                {formatLabelText(order.paymentStatus) || "Pending"}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-[#E2E8F0] bg-[#F8FAFC] sm:grid-cols-4">
          <div className="p-4 sm:px-6">
            <p className="text-xs font-medium text-[#64748B]">Order Date</p>
            <p className="mt-1 text-sm font-bold text-[#101828]">
              {formatDateShort(order.createdAt) || "N/A"}
            </p>
          </div>

          <div className="border-l border-[#E2E8F0] p-4 sm:px-6">
            <p className="text-xs font-medium text-[#64748B]">Items</p>
            <p className="mt-1 text-sm font-bold text-[#101828] tabular-nums">
              {totalQuantity} {totalQuantity === 1 ? "unit" : "units"}
            </p>
          </div>

          <div className="border-t border-[#E2E8F0] p-4 sm:border-l sm:border-t-0 sm:px-6">
            <p className="text-xs font-medium text-[#64748B]">Payment Method</p>
            <p className="mt-1 text-sm font-bold text-[#101828]">
              {isCOD ? "Cash on Delivery" : "Online Payment"}
            </p>
          </div>

          <div className="border-l border-t border-[#E2E8F0] p-4 sm:border-t-0 sm:px-6">
            <p className="text-xs font-medium text-[#64748B]">Order Total</p>
            <p className="mt-1 text-base font-extrabold text-[#0755E9] tabular-nums">
              {formatCurrencyINR(order.totalAmount)}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Main Column */}
        <div className="min-w-0 space-y-6">
          {/* Ordered Products */}
          <InfoCard>
            <SectionHeading
              icon={Package}
              title={`Ordered Items (${items.length})`}
              subtitle="Items included in this ELENZO order"
            />

            {items.length === 0 ? (
              <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                No item details available.
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {items.map((item, index) => {
                  const thumbnailUrl = getOrderThumbnailUrl(item.thumbnail);
                  const attributes = getVariantAttributes(item.attributes);
                  const productHref = item.slug
                    ? `/products/${item.slug}`
                    : "";
                  const hasMrpSavings =
                    Number(item.mrp) > Number(item.sellingPrice);

                  return (
                    <div
                      key={item.variantId || item.product || index}
                      className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                    >
                      {productHref ? (
                        <Link
                          href={productHref}
                          aria-label={item.productName || "View product"}
                          className="self-start transition hover:opacity-90"
                        >
                          <OrderProductImage
                            src={thumbnailUrl}
                            alt={item.productName || "Product"}
                          />
                        </Link>
                      ) : (
                        <OrderProductImage
                          src={thumbnailUrl}
                          alt={item.productName || "Product"}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        {productHref ? (
                          <Link
                            href={productHref}
                            className="inline-block font-extrabold leading-snug text-[#101828] transition hover:text-[#0755E9]"
                          >
                            {item.productName || "Product"}
                          </Link>
                        ) : (
                          <h3 className="font-extrabold leading-snug text-[#101828]">
                            {item.productName || "Product"}
                          </h3>
                        )}

                        {item.sku && (
                          <p className="mt-1 text-xs font-medium text-[#64748B]">
                            SKU: {item.sku}
                          </p>
                        )}

                        {attributes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {attributes.map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-semibold capitalize text-[#101828]"
                              >
                                <span className="text-[#64748B]">{key}:</span>{" "}
                                {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                          <span className="font-semibold text-[#101828]">
                            Qty: {item.quantity || 0}
                          </span>
                          <span>
                            Unit price:{" "}
                            <strong className="text-[#101828]">
                              {formatCurrencyINR(item.sellingPrice)}
                            </strong>
                            {hasMrpSavings && (
                              <span className="ml-1.5 line-through opacity-75">
                                {formatCurrencyINR(item.mrp)}
                              </span>
                            )}
                          </span>
                          {productHref && (
                            <Link
                              href={productHref}
                              className="inline-flex items-center gap-1 font-bold text-[#0755E9] hover:underline"
                            >
                              View product
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <span className="text-xs font-medium text-[#64748B]">
                          Item Total
                        </span>
                        <p className="mt-0.5 text-base font-extrabold text-[#101828] tabular-nums">
                          {formatCurrencyINR(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </InfoCard>

          {/* Order Progress & Timeline */}
          <InfoCard>
            <SectionHeading
              icon={Truck}
              title="Order Progress"
              subtitle="Verified status milestones for your order"
              rightSlot={
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold text-[#0755E9] tabular-nums">
                    {timeline?.progressPercent || 0}%
                  </span>
                  {hasShipmentTracking && (
                    <Link
                      href={`/account/orders/${order._id}/tracking`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0755E9] hover:underline"
                    >
                      Live Tracking
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              }
            />

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#F8FAFC]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  timeline?.terminal?.isTerminal
                    ? timeline.terminal.kind === "returned"
                      ? "bg-orange-500"
                      : "bg-red-500"
                    : "bg-[#0755E9]"
                }`}
                style={{ width: `${timeline?.progressPercent || 0}%` }}
              />
            </div>

            <OrderStatusTimeline timeline={timeline} compact />
          </InfoCard>

          {/* Delivery Address & Payment Information Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Delivery Address */}
            <InfoCard>
              <SectionHeading
                icon={MapPin}
                title="Delivery Address"
                subtitle="Address saved with this order"
              />

              <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-sm font-extrabold text-[#101828]">
                  {address.fullName || "Name not available"}
                </p>

                <div className="space-y-1 text-xs leading-5 text-[#64748B]">
                  {address.addressLine1 && (
                    <p className="font-medium text-[#101828]">
                      {address.addressLine1}
                    </p>
                  )}
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  {address.landmark && (
                    <p>Landmark: {address.landmark}</p>
                  )}
                  <p>
                    {[address.city, address.state].filter(Boolean).join(", ")}
                    {address.pincode ? ` - ${address.pincode}` : ""}
                  </p>
                  {address.country && <p>{address.country}</p>}
                </div>

                <div className="space-y-1 border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B]">
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[#0755E9]" />
                    <span>Phone:</span>
                    <strong className="text-[#101828]">
                      {address.phone || "N/A"}
                    </strong>
                  </p>
                  {address.alternatePhone && (
                    <p className="pl-5">
                      Alternate:{" "}
                      <strong className="text-[#101828]">
                        {address.alternatePhone}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </InfoCard>

            {/* Payment Information */}
            <InfoCard>
              <SectionHeading
                icon={CreditCard}
                title="Payment Information"
                subtitle="Verified method and settlement status"
              />

              <div className="space-y-3.5">
                <InfoRow
                  label="Payment method"
                  value={isCOD ? "Cash on Delivery" : "Online Payment"}
                />

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[#64748B]">Payment status</span>
                  <StatusPill status={order.paymentStatus}>
                    {formatLabelText(order.paymentStatus) || "Pending"}
                  </StatusPill>
                </div>

                {transactionReference && (
                  <InfoRow
                    label="Transaction ref"
                    value={transactionReference}
                    valueClass="break-all"
                  />
                )}

                <InfoRow
                  label="Paid amount"
                  value={
                    isPaid
                      ? formatCurrencyINR(order.totalAmount)
                      : formatCurrencyINR(0)
                  }
                  valueClass={isPaid ? "text-emerald-700" : ""}
                />

                {order.paidAt && (
                  <InfoRow label="Paid on" value={formatDateTime(order.paidAt)} />
                )}

                {isRefunded && (
                  <InfoRow
                    label="Refund status"
                    value={formatLabelText(order.paymentStatus)}
                    valueClass="text-orange-700"
                  />
                )}

                {isCOD && !isPaid && !isCancelled && (
                  <div className="flex items-start gap-2 rounded-xl border border-[#0755E9]/20 bg-[#EFF6FF] p-3 text-xs leading-5 text-[#082B70]">
                    <Truck size={15} className="mt-0.5 shrink-0 text-[#0755E9]" />
                    <span>
                      Pay{" "}
                      <strong>{formatCurrencyINR(order.totalAmount)}</strong> upon
                      delivery.
                    </span>
                  </div>
                )}

                {!isCOD && !isPaid && !isCancelled && !isRefunded && (
                  <div
                    className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${
                      isPaymentFailed
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <Clock3 size={15} className="mt-0.5 shrink-0" />
                    <span>
                      {isPaymentFailed
                        ? "Online payment was not completed. Please contact support if money was debited."
                        : "Your online payment has not been confirmed by the gateway yet."}
                    </span>
                  </div>
                )}
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Sticky Sidebar Column */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          {/* Price Breakdown */}
          <InfoCard>
            <SectionHeading
              icon={ReceiptText}
              title="Price Breakdown"
              subtitle="Recorded order totals"
            />

            <div className="space-y-3.5">
              <InfoRow
                label="Subtotal"
                value={formatCurrencyINR(order.subtotal)}
              />

              {discountAmount > 0 && (
                <InfoRow
                  label={
                    couponCode
                      ? `Coupon Discount (${couponCode})`
                      : "Discount"
                  }
                  value={`-${formatCurrencyINR(discountAmount)}`}
                  valueClass="text-emerald-700"
                />
              )}

              <InfoRow
                label="Shipping charge"
                value={
                  shippingFee === 0 ? "Free" : formatCurrencyINR(shippingFee)
                }
                valueClass={shippingFee === 0 ? "text-emerald-700" : ""}
              />

              {taxAmount > 0 && (
                <InfoRow label="Tax" value={formatCurrencyINR(taxAmount)} />
              )}

              <div className="border-t border-dashed border-[#E2E8F0] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-extrabold text-[#101828]">
                    Final Total
                  </span>
                  <span className="text-xl font-extrabold text-[#0755E9] tabular-nums">
                    {formatCurrencyINR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {order.orderStatus === "Delivered" && returnEligibility.reason && (
              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs leading-5 text-[#64748B]">
                <p className="font-bold text-[#101828]">Return Policy</p>
                <p className="mt-1">{returnEligibility.reason}</p>
                {returnEligibility.eligible && (
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(true)}
                    className="mt-2.5 inline-flex items-center gap-1.5 font-bold text-[#0755E9] hover:underline"
                  >
                    <RotateCcw size={13} />
                    Initiate Return Request
                  </button>
                )}
              </div>
            )}
          </InfoCard>

          {/* Shipment Snapshot */}
          {(hasShipmentTracking ||
            shipment?.courierName ||
            shipment?.estimatedDeliveryDate ||
            shipment?.trackingUrl) && (
            <InfoCard>
              <SectionHeading
                icon={Truck}
                title="Shipment Details"
                subtitle="Courier and tracking details"
              />

              <div className="space-y-3">
                {(shipment.courierName || shipment.provider) && (
                  <InfoRow
                    label="Courier"
                    value={shipment.courierName || shipment.provider}
                  />
                )}
                {shipment.shipmentId && (
                  <InfoRow
                    label="Shipment ID"
                    value={shipment.shipmentId}
                    valueClass="break-all"
                  />
                )}
                {shipment.awbCode && (
                  <InfoRow
                    label="AWB Number"
                    value={shipment.awbCode}
                    valueClass="break-all"
                  />
                )}
                {shipment.currentStatus && (
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#64748B]">Shipment status</span>
                    <StatusPill status={shipment.currentStatus}>
                      {formatLabelText(shipment.currentStatus)}
                    </StatusPill>
                  </div>
                )}
                {shipment.estimatedDeliveryDate && (
                  <InfoRow
                    label="Estimated delivery"
                    value={formatDateShort(shipment.estimatedDeliveryDate)}
                  />
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                {hasShipmentTracking && (
                  <Link
                    href={`/account/orders/${order._id}/tracking`}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                  >
                    <Truck size={15} />
                    View Full Tracking Timeline
                  </Link>
                )}

                {shipment.trackingUrl && (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0755E9]/25 bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
                  >
                    Track Shipment on Courier Site
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </InfoCard>
          )}

          {/* Help & Support */}
          <InfoCard>
            <SectionHeading
              icon={ShieldCheck}
              title="Need Help?"
              subtitle="Order questions and customer assistance"
            />

            <p className="text-xs leading-5 text-[#64748B]">
              Questions about delivery, cancellation, or returns for this order?
              Reach out to {BRAND_NAME} Customer Support with order{" "}
              <strong className="text-[#101828]">#{orderNumber}</strong>.
            </p>

            <a
              href={`mailto:${BRAND_SUPPORT_EMAIL}?subject=${supportSubject}`}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0755E9]/25 bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
            >
              <Mail size={15} />
              Contact Support ({BRAND_SUPPORT_EMAIL})
            </a>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Link
                href="/account/orders"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:text-[#0755E9]"
              >
                <Package size={14} />
                My Orders
              </Link>
              <Link
                href="/products"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:text-[#0755E9]"
              >
                <ShoppingBag size={14} />
                Shop More
              </Link>
            </div>
          </InfoCard>
        </aside>
      </div>

      {/* Customer Return Request Modal */}
      {showReturnModal && (
        <OrderReturnModal
          order={order}
          open={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          onSuccess={(ret) => setSubmittedReturn(ret)}
        />
      )}

      {/* Customer Cancel Order Modal */}
      <CancelOrderModal
        key={order?._id || "detail-cancel-modal"}
        order={order}
        open={showCancelModal}
        loading={Boolean(cancellingOrderId)}
        error={cancelError || ""}
        onClose={() => {
          setShowCancelModal(false);
          dispatch(clearCancelError());
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen w-full bg-[#FFFFFF] px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-8 xl:pb-12">
        <OrderDetailsContent />
      </main>
    </ProtectedRoute>
  );
}
