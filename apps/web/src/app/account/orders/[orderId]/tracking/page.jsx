
"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion } from "framer-motion";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  ArrowLeft,
  ShoppingBag,
  CalendarDays,
  PackageCheck,
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
  CircleHelp,
  Box,
} from "lucide-react";

import {
  clearTracking,
  selectOrderTracking,
  selectTrackingLoading,
  selectTrackingError,
} from "@/store/slices/trackingSlice";

import { fetchOrderTracking } from "@/store/thunks/trackingThunks";

/* --------------------------------
   TRACKING STAGES
--------------------------------- */

const TRACKING_STEPS = [
  {
    status: "NEW",
    title: "Order Received",
    description: "Your order has been successfully registered.",
    icon: ShoppingBag,
    color: "blue",
  },
  {
    status: "PICKUP SCHEDULED",
    title: "Pickup Scheduled",
    description: "The courier pickup has been arranged.",
    icon: CalendarDays,
    color: "violet",
  },
  {
    status: "PICKED UP",
    title: "Package Picked Up",
    description: "Your package has been collected by the courier.",
    icon: PackageCheck,
    color: "cyan",
  },
  {
    status: "IN TRANSIT",
    title: "In Transit",
    description: "Your package is moving towards its destination.",
    icon: Truck,
    color: "amber",
  },
  {
    status: "OUT FOR DELIVERY",
    title: "Out for Delivery",
    description: "Your package is on its way to your doorstep.",
    icon: MapPin,
    color: "orange",
  },
  {
    status: "DELIVERED",
    title: "Delivered",
    description: "Your package has been successfully delivered.",
    icon: House,
    color: "emerald",
  },
];

/* --------------------------------
   UNIQUE STAGE COLORS
--------------------------------- */

const STEP_STYLES = {
  blue: {
    active: "bg-blue-600 text-white ring-4 ring-blue-100",
    completed: "bg-blue-600 text-white",
    pending: "bg-blue-50 text-blue-300",
    line: "bg-blue-500",
    label: "bg-blue-50 text-blue-700",
  },

  violet: {
    active: "bg-violet-600 text-white ring-4 ring-violet-100",
    completed: "bg-violet-600 text-white",
    pending: "bg-violet-50 text-violet-300",
    line: "bg-violet-500",
    label: "bg-violet-50 text-violet-700",
  },

  cyan: {
    active: "bg-cyan-600 text-white ring-4 ring-cyan-100",
    completed: "bg-cyan-600 text-white",
    pending: "bg-cyan-50 text-cyan-300",
    line: "bg-cyan-500",
    label: "bg-cyan-50 text-cyan-700",
  },

  amber: {
    active: "bg-amber-500 text-white ring-4 ring-amber-100",
    completed: "bg-amber-500 text-white",
    pending: "bg-amber-50 text-amber-300",
    line: "bg-amber-500",
    label: "bg-amber-50 text-amber-700",
  },

  orange: {
    active: "bg-orange-600 text-white ring-4 ring-orange-100",
    completed: "bg-orange-600 text-white",
    pending: "bg-orange-50 text-orange-300",
    line: "bg-orange-500",
    label: "bg-orange-50 text-orange-700",
  },

  emerald: {
    active: "bg-emerald-600 text-white ring-4 ring-emerald-100",
    completed: "bg-emerald-600 text-white",
    pending: "bg-emerald-50 text-emerald-300",
    line: "bg-emerald-500",
    label: "bg-emerald-50 text-emerald-700",
  },
};

/* --------------------------------
   HELPERS
--------------------------------- */

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const getCurrentStepIndex = (status) => {
  const normalized = normalizeStatus(status);

  const aliases = {
    "PICKUP REQUESTED": "PICKUP SCHEDULED",
    "PICKUP SCHEDULED": "PICKUP SCHEDULED",
    "PICKED UP": "PICKED UP",
    SHIPPED: "IN TRANSIT",
    "IN TRANSIT": "IN TRANSIT",
    "OUT FOR DELIVERY": "OUT FOR DELIVERY",
    DELIVERED: "DELIVERED",
  };

  const resolvedStatus = aliases[normalized] || normalized;

  return TRACKING_STEPS.findIndex(
    (step) => step.status === resolvedStatus
  );
};

/* --------------------------------
   INFO CARD
--------------------------------- */

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9] transition group-hover:bg-[#0755E9] group-hover:text-white">
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-all text-sm font-bold text-slate-900">
            {value || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   TRACKING PAGE CONTENT
--------------------------------- */

function TrackingContent() {
  const params = useParams();
  const orderId = params?.orderId;

  const dispatch = useDispatch();

  const tracking = useSelector(selectOrderTracking);
  const loading = useSelector(selectTrackingLoading);
  const error = useSelector(selectTrackingError);

  const loadTracking = useCallback(() => {
    if (orderId) {
      dispatch(fetchOrderTracking(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    loadTracking();

    return () => {
      dispatch(clearTracking());
    };
  }, [loadTracking, dispatch]);

  const shipment = tracking?.shipment;

  const currentStatus = normalizeStatus(
    shipment?.currentStatus
  );

  const currentStepIndex = getCurrentStepIndex(currentStatus);

  const trackingHistory = Array.isArray(
    shipment?.trackingHistory
  )
    ? shipment.trackingHistory
    : [];

  const getHistoryEvent = (status) => {
    return trackingHistory.find(
      (event) =>
        normalizeStatus(event.status || event.event) === status
    );
  };

  const isDelivered = currentStatus === "DELIVERED";

  const hasTracking = Boolean(
    shipment?.shipmentId ||
    shipment?.awbCode ||
    shipment?.currentStatus
  );

  const progress =
    currentStepIndex >= 0
      ? ((currentStepIndex + 1) / TRACKING_STEPS.length) * 100
      : 0;

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-9">
      <div className="mx-auto w-full">

        {/* BACK NAVIGATION */}

        <Link
          href="/account/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0755E9]"
        >
          <ArrowLeft size={17} />
          Back to My Orders
        </Link>

        {/* PAGE HEADER */}

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-[#0755E9]" />

              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0755E9]">
                MOBI HUB
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
              Track Your Order
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Follow your package and stay updated on its delivery.
            </p>
          </div>

          {!loading && tracking && (
            <button
              type="button"
              onClick={loadTracking}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#0755E9] hover:text-[#0755E9] disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Refresh Tracking
            </button>
          )}
        </div>

        {/* LOADING STATE */}

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <RefreshCw
                size={28}
                className="animate-spin text-[#0755E9]"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Loading tracking information
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch your shipment details.
            </p>
          </div>
        )}

        {/* ERROR STATE */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Package size={28} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load tracking
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadTracking}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* TRACKING DATA */}

        {!loading && !error && tracking && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >

            {/* CURRENT STATUS HERO */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0755E9] via-[#164FCB] to-[#082B70] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />

              <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

              <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isDelivered
                          ? "bg-green-400"
                          : "animate-pulse bg-yellow-300"
                      }`}
                    />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-50">
                      {isDelivered
                        ? "Delivery Completed"
                        : "Shipment Status"}
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-medium uppercase tracking-widest text-blue-100">
                    Current Shipment Status
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                    {shipment?.currentStatus || "Processing"}
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100">
                    {isDelivered
                      ? "Your package has been marked as delivered."
                      : "Your package is moving through the delivery process."}
                  </p>
                </div>

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-sm">
                  {isDelivered ? (
                    <House size={42} />
                  ) : (
                    <Truck size={42} />
                  )}
                </div>
              </div>

              {/* HERO DETAILS */}

              <div className="relative z-10 mt-7 grid grid-cols-1 gap-5 border-t border-white/15 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] text-blue-200">
                    Order Number
                  </p>

                  <p className="mt-1 break-all text-sm font-bold">
                    {tracking.orderNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-blue-200">
                    Order Date
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(tracking.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-blue-200">
                    Estimated Delivery
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(shipment?.estimatedDeliveryDate)}
                  </p>
                </div>
              </div>
            </section>

            {/* SHIPMENT INFORMATION */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-extrabold text-[#101828]">
                  Shipment Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Important details about your delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <InfoCard
                  icon={Truck}
                  label="Courier Partner"
                  value={
                    shipment?.courierName ||
                    shipment?.provider ||
                    "Not assigned"
                  }
                />

                <InfoCard
                  icon={Package}
                  label="AWB / Tracking Number"
                  value={shipment?.awbCode || "Not available"}
                />

                <InfoCard
                  icon={MapPinned}
                  label="Shipment ID"
                  value={shipment?.shipmentId || "Not available"}
                />

              </div>

              {shipment?.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-[#0755E9] transition hover:bg-blue-100 sm:w-fit"
                >
                  Track on Courier Website
                  <ExternalLink size={15} />
                </a>
              )}
            </section>

            {/* PREMIUM DELIVERY TIMELINE */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* TIMELINE HEADER */}

              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-7">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0755E9]">
                    MOBI HUB DELIVERY
                  </span>

                  <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                    Shipment Journey
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Follow every step of your package delivery.
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
                  <Truck size={17} className="text-[#0755E9]" />

                  <span className="text-xs font-bold text-[#0755E9]">
                    {Math.max(0, currentStepIndex + 1)} of 6 stages
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR */}

              <div className="px-5 pt-6 sm:px-7">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Order Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  />
                </div>
              </div>

              {/* TIMELINE CONTENT */}

              <div className="p-5 sm:p-7">
                <div className="space-y-0">

                  {TRACKING_STEPS.map((step, index) => {
                    const Icon = step.icon;

                    const styles = STEP_STYLES[step.color];

                    const event = getHistoryEvent(step.status);

                    const completed =
                      currentStepIndex >= 0 &&
                      index <= currentStepIndex;

                    const active = index === currentStepIndex;

                    const isLast =
                      index === TRACKING_STEPS.length - 1;

                    const connectorCompleted =
                      currentStepIndex >= 0 &&
                      index < currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className="relative flex gap-4 sm:gap-6"
                      >

                        {/* CONNECTOR */}

                        {!isLast && (
                          <div
                            className={`absolute left-[22px] top-[52px] h-[calc(100%-42px)] w-0.5 transition-colors duration-500 ${
                              connectorCompleted
                                ? styles.line
                                : "bg-slate-100"
                            }`}
                          />
                        )}

                        {/* UNIQUE ICON */}

                        <div
                          className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                            active
                              ? styles.active
                              : completed
                                ? styles.completed
                                : styles.pending
                          }`}
                        >
                          <Icon size={20} strokeWidth={2.2} />
                        </div>

                        {/* STAGE DETAILS */}

                        <div
                          className={`mb-7 min-w-0 flex-1 rounded-2xl border p-4 transition-all duration-300 sm:mb-8 ${
                            active
                              ? "border-blue-200 bg-blue-50/60 shadow-sm"
                              : completed
                                ? "border-slate-100 bg-white"
                                : "border-slate-100 bg-slate-50/60"
                          }`}
                        >
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">

                            <div>
                              <h3
                                className={`text-sm font-extrabold ${
                                  completed
                                    ? "text-slate-900"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.title}
                              </h3>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {event?.description || step.description}
                              </p>
                            </div>

                            {active && (
                              <span
                                className={`w-fit shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${styles.label}`}
                              >
                                Current
                              </span>
                            )}

                            {!active && completed && (
                              <span className="w-fit shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                                Completed
                              </span>
                            )}

                            {!completed && (
                              <span className="w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-400">
                                Pending
                              </span>
                            )}

                          </div>

                          {/* EVENT DETAILS */}

                          {event && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-3">

                              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <Clock3 size={13} />

                                {formatDateTime(
                                  event.timestamp ||
                                  event.date ||
                                  event.createdAt ||
                                  event.updatedAt
                                )}
                              </span>

                              {event.location && (
                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                  <MapPin size={13} />
                                  {event.location}
                                </span>
                              )}

                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            </section>

            {/* TRACKING HISTORY */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
                  <Clock3 size={21} />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#101828]">
                    Tracking History
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Recent updates about your shipment.
                  </p>
                </div>
              </div>

              {trackingHistory.length > 0 ? (
                <div className="mt-6 space-y-3">

                  {[...trackingHistory]
                    .reverse()
                    .map((event, index) => (
                      <div
                        key={event._id || index}
                        className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0755E9] shadow-sm">
                          <CheckCircle2 size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                            <p className="text-sm font-bold text-[#101828]">
                              {event.status ||
                                event.event ||
                                "Shipment Update"}
                            </p>

                            <span className="text-[11px] text-slate-400">
                              {formatDateTime(
                                event.timestamp ||
                                event.date ||
                                event.createdAt ||
                                event.updatedAt
                              )}
                            </span>
                          </div>

                          {event.description && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {event.description}
                            </p>
                          )}

                          {event.location && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                              <MapPin size={12} />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-8 text-center">
                  <Clock3
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No tracking history available
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Shipment updates will appear here.
                  </p>
                </div>
              )}

            </section>

            {/* SUPPORT CARD */}

            <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">

              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#101828]">
                    Need help with your order?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Our support team is here to help you.
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#0645C4]"
              >
                Contact Support
                <ExternalLink size={14} />
              </Link>

            </section>

          </motion.div>
        )}

        {/* NO TRACKING DATA */}

        {!loading && !error && !tracking && (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0755E9]">
              <Box size={30} />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-[#101828]">
              Tracking information unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please try again later or contact our support team.
            </p>

            <button
              type="button"
              onClick={loadTracking}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>
        )}

      </div>
    </main>
  );
}

/* --------------------------------
   PROTECTED PAGE
--------------------------------- */

export default function TrackingPage() {
  return (
    <ProtectedRoute>
      <TrackingContent />
    </ProtectedRoute>
  );
}
