"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Truck,
  MapPin,
  House,
  Clock3,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  MapPinned,
  Package,
  AlertCircle,
  Copy,
  Check,
  Mail,
  ShoppingBag,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrackingSkeleton from "@/components/loading/skeletons/TrackingSkeleton";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";
import { BRAND_ASSETS, BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";
import orderService from "@/services/orderService";
import {
  clearTracking,
  selectOrderTracking,
  selectTrackingError,
  selectTrackingLoading,
} from "@/store/slices/trackingSlice";
import { fetchOrderTracking } from "@/store/thunks/trackingThunks";
import {
  formatDateShort,
  formatDateTime,
  formatLabelText,
  getOrderStatusBadgeClasses,
  resolveOrderTimeline,
} from "@/components/orders/orderTimelineUtils";

function ShipmentDetailTile({ icon: Icon, label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      toast.success(`${label} copied.`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy.");
    }
  };

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0755E9] shadow-xs">
          <Icon size={18} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            {label}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="break-all text-sm font-bold text-[#101828]">
              {value}
            </p>
            {copyable && value && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy ${label}`}
                className="shrink-0 rounded-lg border border-[#E2E8F0] bg-white p-1.5 text-[#64748B] transition hover:border-[#0755E9]/40 hover:text-[#0755E9]"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingContent() {
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const dispatch = useDispatch();

  const tracking = useSelector(selectOrderTracking);
  const trackingLoading = useSelector(selectTrackingLoading);
  const trackingError = useSelector(selectTrackingError);

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderLoading, setOrderLoading] = useState(Boolean(orderId));
  const [orderError, setOrderError] = useState(
    orderId ? "" : "Order ID is missing from the URL."
  );
  const [orderNotFound, setOrderNotFound] = useState(false);

  const loadAllTrackingData = useCallback(() => {
    if (!orderId) return;

    dispatch(fetchOrderTracking(orderId));
    setOrderLoading(true);
    setOrderError("");
    setOrderNotFound(false);

    orderService
      .getOrderById(orderId)
      .then((response) => {
        const data = response?.data?.data || response?.data || response;
        if (data?._id) {
          setOrderDetails(data);
        }
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setOrderNotFound(true);
        }
        setOrderError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load order details."
        );
      })
      .finally(() => {
        setOrderLoading(false);
      });
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;

    dispatch(fetchOrderTracking(orderId));

    orderService
      .getOrderById(orderId)
      .then((response) => {
        if (!active) return;
        const data = response?.data?.data || response?.data || response;
        if (data?._id) {
          setOrderDetails(data);
        }
        setOrderError("");
        setOrderNotFound(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err?.response?.status === 404) {
          setOrderNotFound(true);
        }
        setOrderError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load order details."
        );
      })
      .finally(() => {
        if (active) {
          setOrderLoading(false);
        }
      });

    return () => {
      active = false;
      dispatch(clearTracking());
    };
  }, [dispatch, orderId]);

  const effectiveOrderStatus =
    tracking?.orderStatus || orderDetails?.orderStatus || "";
  const effectiveShipment = useMemo(
    () => tracking?.shipment || orderDetails?.shipment || {},
    [tracking?.shipment, orderDetails?.shipment]
  );
  const effectiveOrderNumber =
    tracking?.orderNumber || orderDetails?.orderNumber || orderId;
  const effectiveCreatedAt =
    tracking?.createdAt || orderDetails?.createdAt || null;

  const timeline = useMemo(() => {
    if (!tracking && !orderDetails) return null;
    return resolveOrderTimeline({
      orderStatus: effectiveOrderStatus,
      orderStatusHistory: orderDetails?.orderStatusHistory || [],
      createdAt: effectiveCreatedAt,
      deliveredAt: orderDetails?.deliveredAt || null,
      cancelledAt: orderDetails?.cancelledAt || null,
      shipment: effectiveShipment,
    });
  }, [
    tracking,
    orderDetails,
    effectiveOrderStatus,
    effectiveCreatedAt,
    effectiveShipment,
  ]);

  const isInitialLoading =
    (trackingLoading || orderLoading) && !tracking && !orderDetails;
  const isRefreshing = trackingLoading || orderLoading;

  if (isInitialLoading) {
    return <TrackingSkeleton />;
  }

  // Order itself does not exist or hard error when neither tracking nor order loaded
  if (!tracking && !orderDetails && (orderNotFound || orderError || trackingError)) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
          {orderNotFound ? <Package size={28} /> : <AlertCircle size={28} />}
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-[#101828]">
          {orderNotFound ? "Order not found" : "Unable to load tracking"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          {orderError || trackingError || "Tracking information unavailable."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!orderNotFound && (
            <button
              type="button"
              onClick={loadAllTrackingData}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}

          <Link
            href="/account/orders"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <ArrowLeft size={16} />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const hasShipmentTracking = Boolean(
    effectiveShipment?.shipmentId || effectiveShipment?.awbCode
  );
  const trackingUnavailableYet =
    !tracking &&
    !hasShipmentTracking &&
    Boolean(orderDetails);

  const isDelivered =
    timeline?.activeStageIndex === 7 ||
    String(effectiveOrderStatus).toLowerCase() === "delivered" ||
    String(effectiveShipment?.currentStatus || "").toUpperCase() ===
      "DELIVERED";

  const address = orderDetails?.shippingAddress || null;
  const trackingHistory = timeline?.chronologicalTrackingHistory || [];
  const supportSubject = encodeURIComponent(
    `${BRAND_NAME} Tracking Support - #${effectiveOrderNumber}`
  );

  const heroStatusTitle = timeline?.terminal?.isTerminal
    ? timeline.terminal.label
    : effectiveShipment?.currentStatus
      ? formatLabelText(effectiveShipment.currentStatus)
      : effectiveOrderStatus || "Pending";

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-6">
      <Breadcrumb
        items={[
          { label: "My Account", href: "/account" },
          { label: "My Orders", href: "/account/orders" },
          {
            label: `#${effectiveOrderNumber}`,
            href: `/account/orders/${orderId}`,
          },
          { label: "Track Order" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href={`/account/orders/${orderId}`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] transition hover:text-[#0755E9]"
          >
            <ArrowLeft size={14} />
            Back to Order Details
          </Link>

          <div className="flex items-center gap-2">
            <Image
              src={BRAND_ASSETS.icon}
              alt={BRAND_NAME}
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0755E9]">
              {BRAND_NAME} Tracking
            </span>
          </div>

          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
            Shipment Tracking
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Real-time courier milestones and shipment progress for Order #
            {effectiveOrderNumber}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadAllTrackingData}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-[#0755E9]" : ""}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Tracking"}
          </button>

          <Link
            href={`/account/orders/${orderId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
          >
            <Package size={14} />
            Order Details
          </Link>
        </div>
      </div>

      {/* Hero Status Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#082B70] p-6 text-white shadow-xs sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  timeline?.terminal?.isTerminal
                    ? "bg-red-400"
                    : isDelivered
                      ? "bg-emerald-400"
                      : "animate-pulse bg-sky-300"
                }`}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-50">
                {timeline?.terminal?.isTerminal
                  ? timeline.terminal.label
                  : isDelivered
                    ? "Delivery Completed"
                    : "Active Shipment"}
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-blue-200">
              Current Status
            </p>

            <h2 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">
              {heroStatusTitle}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              {timeline?.terminal?.isTerminal
                ? timeline.terminalNote ||
                  "This shipment has ended in a terminal state."
                : isDelivered
                  ? "Your package has been delivered to your shipping address."
                  : trackingUnavailableYet
                    ? "Your order is confirmed in our system and waiting for courier pickup assignment."
                    : "Your package is progressing through the courier network."}
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 sm:h-20 sm:w-20">
            {isDelivered ? (
              <House size={36} aria-hidden="true" />
            ) : (
              <Truck size={36} aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-medium text-blue-200">
              Order Number
            </p>
            <p className="mt-1 break-all text-sm font-bold">
              #{effectiveOrderNumber}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-blue-200">Order Date</p>
            <p className="mt-1 text-sm font-bold">
              {formatDateShort(effectiveCreatedAt) || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-blue-200">
              Estimated Delivery
            </p>
            <p className="mt-1 text-sm font-bold">
              {effectiveShipment?.estimatedDeliveryDate
                ? formatDateShort(effectiveShipment.estimatedDeliveryDate)
                : isDelivered && (effectiveShipment?.deliveredAt || orderDetails?.deliveredAt)
                  ? `Delivered ${formatDateShort(
                      effectiveShipment?.deliveredAt || orderDetails?.deliveredAt
                    )}`
                  : "Awaiting courier update"}
            </p>
          </div>
        </div>
      </section>

      {/* Tracking Not Available Yet Banner */}
      {trackingUnavailableYet && !timeline?.terminal?.isTerminal && (
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0755E9]/25 bg-[#EFF6FF] p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0755E9] shadow-xs">
              <Clock3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#082B70]">
                Courier tracking details are not assigned yet
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#101828]/80">
                {trackingError ||
                  "Once a courier partner picks up your package and issues an AWB number, live scans and courier tracking links will appear here automatically."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAllTrackingData}
            disabled={isRefreshing}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Check Again
          </button>
        </section>
      )}

      {/* Main 2-Column Tracking Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Main Column */}
        <div className="min-w-0 space-y-6">
          {/* 8-Stage Visual Timeline */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0755E9]">
                  {BRAND_NAME} Delivery
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[#101828] sm:text-xl">
                  Order & Shipment Timeline
                </h2>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold text-[#0755E9] tabular-nums">
                <Truck size={14} />
                {timeline?.progressPercent || 0}% Complete
              </span>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span>Delivery Progress</span>
                <span className="tabular-nums">
                  {timeline?.progressPercent || 0}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#F8FAFC]">
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
            </div>

            <OrderStatusTimeline timeline={timeline} />
          </section>

          {/* Tracking History (Chronological Order) */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-7">
            <div className="mb-5 flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                <Clock3 size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#101828] sm:text-lg">
                  Tracking History
                </h2>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  Chronological shipment scan activity (earliest to latest)
                </p>
              </div>
            </div>

            {trackingHistory.length > 0 ? (
              <ol className="space-y-3">
                {trackingHistory.map((event, index) => {
                  const eventTime = formatDateTime(
                    event.timestamp ||
                      event.date ||
                      event.createdAt ||
                      event.updatedAt
                  );

                  return (
                    <li
                      key={event._id || index}
                      className="flex gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0755E9] shadow-xs">
                        <CheckCircle2 size={17} aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-[#101828]">
                              {formatLabelText(
                                event.status || event.event || "Shipment Update"
                              )}
                            </span>
                            {event.source && (
                              <span className="rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-[#64748B]">
                                {event.source}
                              </span>
                            )}
                          </div>

                          {eventTime && (
                            <span className="text-[11px] font-medium text-[#64748B]">
                              {eventTime}
                            </span>
                          )}
                        </div>

                        {event.description && (
                          <p className="mt-1.5 text-xs leading-5 text-[#64748B]">
                            {event.description}
                          </p>
                        )}

                        {event.location && (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#101828]">
                            <MapPin size={12} className="text-[#0755E9]" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-8 text-center">
                <Clock3 size={28} className="mx-auto text-[#64748B]/40" />
                <p className="mt-3 text-sm font-bold text-[#101828]">
                  No courier scan events yet
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Carrier scan updates with timestamps and hubs will appear here
                  in chronological order.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Column */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          {/* Courier & Shipment Information */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-extrabold text-[#101828]">
              Shipment Information
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Verified courier and consignment identifiers
            </p>

            <div className="mt-4 space-y-3">
              {(effectiveShipment?.courierName || effectiveShipment?.provider) && (
                <ShipmentDetailTile
                  icon={Truck}
                  label="Courier Partner"
                  value={
                    effectiveShipment.courierName || effectiveShipment.provider
                  }
                />
              )}

              {effectiveShipment?.awbCode && (
                <ShipmentDetailTile
                  icon={Package}
                  label="AWB / Tracking Number"
                  value={effectiveShipment.awbCode}
                  copyable
                />
              )}

              {effectiveShipment?.shipmentId && (
                <ShipmentDetailTile
                  icon={MapPinned}
                  label="Shipment ID"
                  value={effectiveShipment.shipmentId}
                  copyable
                />
              )}

              {effectiveShipment?.lastLocation && (
                <ShipmentDetailTile
                  icon={MapPin}
                  label="Last Recorded Location"
                  value={effectiveShipment.lastLocation}
                />
              )}

              {effectiveShipment?.currentStatus && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                  <span className="text-xs font-semibold text-[#64748B]">
                    Shipment Status
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getOrderStatusBadgeClasses(
                      effectiveShipment.currentStatus
                    )}`}
                  >
                    {formatLabelText(effectiveShipment.currentStatus)}
                  </span>
                </div>
              )}

              {!effectiveShipment?.courierName &&
                !effectiveShipment?.provider &&
                !effectiveShipment?.awbCode &&
                !effectiveShipment?.shipmentId && (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs leading-5 text-[#64748B]">
                    Courier details will appear once this order is dispatched.
                  </div>
                )}
            </div>

            {effectiveShipment?.trackingUrl && (
              <a
                href={effectiveShipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
              >
                Track Shipment on Courier Website
                <ExternalLink size={14} />
              </a>
            )}
          </section>

          {/* Delivery Destination Summary */}
          {address && (
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-[#0755E9]" />
                <h2 className="text-base font-extrabold text-[#101828]">
                  Delivery Destination
                </h2>
              </div>

              <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs leading-5 text-[#64748B]">
                <p className="font-bold text-[#101828]">
                  {address.fullName || "Recipient"}
                </p>
                <p className="mt-1">
                  {[address.addressLine1, address.addressLine2]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>
                  {[address.city, address.state].filter(Boolean).join(", ")}
                  {address.pincode ? ` - ${address.pincode}` : ""}
                </p>
              </div>

              <Link
                href={`/account/orders/${orderId}`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0755E9] hover:underline"
              >
                View full order & payment details
                <ArrowRight size={13} />
              </Link>
            </section>
          )}

          {/* Support Card */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#101828]">
                  Need Help With This Shipment?
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Contact {BRAND_NAME} Customer Support with Order #
                  {effectiveOrderNumber}.
                </p>
              </div>
            </div>

            <a
              href={`mailto:${BRAND_SUPPORT_EMAIL}?subject=${supportSubject}`}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0755E9]/25 bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
            >
              <Mail size={15} />
              Email Support ({BRAND_SUPPORT_EMAIL})
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
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen w-full bg-[#FFFFFF] px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-8 xl:pb-12">
        <TrackingContent />
      </main>
    </ProtectedRoute>
  );
}
