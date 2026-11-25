"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import orderService from "@/services/orderService";
import TrackingSkeleton from "@/components/loading/skeletons/TrackingSkeleton";

const TRACKING_STEPS = [
  "NEW",
  "PICKUP SCHEDULED",
  "PICKED UP",
  "IN TRANSIT",
  "OUT FOR DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS = {
  NEW: "Order confirmed",
  "PICKUP SCHEDULED": "Pickup scheduled",
  "PICKED UP": "Picked up by courier",
  "IN TRANSIT": "On the way",
  "OUT FOR DELIVERY": "Out for delivery",
  DELIVERED: "Delivered successfully",
};

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  return STATUS_LABELS[normalized] || String(status || "Pending").replaceAll("_", " ");
};

const formatDate = (date) => {
  if (!date) return "Not available";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusIndex = (status) => TRACKING_STEPS.indexOf(normalizeStatus(status));

function LoadingState() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center bg-[#f5f7fb] px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
        <RefreshCw size={27} className="animate-spin" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-slate-900">Getting your delivery updates</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Please wait while we securely load the latest shipment information.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-[#f5f7fb] px-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <XCircle size={30} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">Tracking details unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={16} /> Try again
        </button>
        <Link href="/account/orders" className="mt-4 block text-sm font-semibold text-blue-600 hover:underline">
          Return to my orders
        </Link>
      </div>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-1 break-words text-sm font-bold text-slate-900">{value || "Not available"}</p>
        </div>
      </div>
    </div>
  );
}

function TrackingContent() {
  const params = useParams();
  const orderId = params?.orderId;

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTracking = useCallback(async () => {
    if (!orderId || typeof orderId !== "string") {
      setTracking(null);
      setError("Order ID is missing from the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await orderService.getOrderTracking(orderId);
      const responseBody = response?.data ?? response;

      if (responseBody?.success === false) {
        throw new Error(responseBody.message || "Unable to fetch tracking details.");
      }

      const trackingData =
        responseBody?.data?.data ??
        responseBody?.data ??
        responseBody;

      if (!trackingData?.shipment || typeof trackingData.shipment !== "object") {
        throw new Error(responseBody?.message || "Shipment information not found.");
      }

      setTracking(trackingData);
    } catch (err) {
      console.error("TRACKING API ERROR:", err);
      setTracking(null);

      if (err?.code === "ECONNABORTED") {
        setError("The request timed out. Please try again.");
      } else if (!err?.response) {
        setError(err?.message || "Unable to connect to the backend server.");
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load tracking details."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const shipment = tracking?.shipment;

  const currentStatus = normalizeStatus(
    shipment?.currentStatus || shipment?.status || tracking?.orderStatus
  );
  const currentIndex = getStatusIndex(currentStatus);

  const history = useMemo(() => {
    if (!Array.isArray(shipment?.trackingHistory)) return [];
    return [...shipment.trackingHistory].sort(
      (a, b) =>
        (new Date(a.timestamp || 0).getTime() || 0) -
        (new Date(b.timestamp || 0).getTime() || 0)
    );
  }, [shipment?.trackingHistory]);

  if (loading) return <TrackingSkeleton />;
  if (error || !tracking || !shipment) {
    return <ErrorState message={error || "Tracking information not found."} onRetry={fetchTracking} />;
  }

  const isDelivered = currentStatus === "DELIVERED";
  const isMockShipment = String(shipment.shipmentId || "").startsWith("MOCK_");
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / TRACKING_STEPS.length) * 100 : 0;
  const latestEvent = history.length ? history[history.length - 1] : null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-10 xl:px-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} /> Back to my orders
          </Link>
          <button
            type="button"
            onClick={fetchTracking}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh tracking
          </button>
        </div>

        {/* Wide delivery summary banner */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] bg-[#101d3a] text-white shadow-xl shadow-slate-200"
        >
          <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full border-[45px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-48 right-[22%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <span className={`h-2 w-2 rounded-full ${isDelivered ? "bg-emerald-400" : "animate-pulse bg-sky-400"}`} />
                MOBI HUB DELIVERY UPDATE
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {isDelivered ? "Your package has arrived." : "Your order is on its way."}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {isDelivered
                  ? "Your shipment has been marked as delivered. We hope you enjoy your purchase."
                  : "Follow each delivery milestone below and check the latest information from your courier."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Order number</p>
                  <p className="mt-1 text-sm font-bold">{tracking.orderNumber || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Current status</p>
                  <p className="mt-1 text-sm font-bold text-sky-300">{getStatusLabel(currentStatus)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5 lg:flex-col lg:items-center lg:justify-center lg:pl-10">
              <div className={`flex h-20 w-20 items-center justify-center rounded-[26px] ${isDelivered ? "bg-emerald-400 text-[#10203e]" : "bg-blue-500 text-white"} shadow-lg`}>
                {isDelivered ? <BadgeCheck size={39} /> : <Truck size={39} />}
              </div>
              <div className="lg:text-center">
                <p className="text-xs font-medium text-slate-400">Shipment ID</p>
                <p className="mt-1 max-w-[220px] break-all text-sm font-bold">{shipment.shipmentId || "Not assigned"}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {isMockShipment && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <Clock3 className="mt-0.5 shrink-0" size={18} />
            <p><strong>Test mode:</strong> This is simulated tracking data. Shipment movements and locations are not live GPS updates.</p>
          </div>
        )}

        {/* Full-width progress */}
        <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Delivery journey</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Shipment progress</h2>
            </div>
            <p className="text-sm font-bold text-slate-500">{currentIndex >= 0 ? `${currentIndex + 1} of ${TRACKING_STEPS.length} stages` : "Awaiting courier update"}</p>
          </div>

          <div className="mt-8 hidden md:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-1.5 rounded-full bg-slate-100" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-5 h-1.5 rounded-full bg-blue-600"
              />
              <div className="relative grid grid-cols-6">
                {TRACKING_STEPS.map((step, index) => {
                  const done = currentIndex >= 0 && index <= currentIndex;
                  const active = index === currentIndex;
                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 ${done ? "border-blue-100 bg-blue-600 text-white" : "border-slate-100 bg-white text-slate-400"} ${active ? "ring-4 ring-blue-100" : ""}`}>
                        {done ? <Check size={18} strokeWidth={3} /> : <span className="text-xs font-bold">{index + 1}</span>}
                      </div>
                      <p className={`mt-4 max-w-[140px] text-xs font-bold leading-5 ${active ? "text-blue-600" : done ? "text-slate-800" : "text-slate-400"}`}>
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {TRACKING_STEPS.map((step, index) => {
              const done = currentIndex >= 0 && index <= currentIndex;
              const active = index === currentIndex;
              return (
                <div key={step} className={`flex items-center gap-3 rounded-xl p-3 ${active ? "bg-blue-50" : "bg-slate-50"}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}>
                    {done ? <Check size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  <p className={`text-sm font-semibold ${active ? "text-blue-700" : done ? "text-slate-800" : "text-slate-400"}`}>{STATUS_LABELS[step]}</p>
                  {active && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-blue-600">Current</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Wide two-column content */}
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.85fr)]">
          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Courier updates</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">Tracking activity</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{history.length} updates</span>
            </div>

            {history.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
                <Package size={28} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">No tracking updates yet</p>
                <p className="mt-1 text-xs text-slate-400">Courier events will appear here when available.</p>
              </div>
            ) : (
              <div className="mt-8">
                {[...history].reverse().map((event, index) => (
                  <div key={`${event.status}-${event.timestamp}-${index}`} className="relative flex gap-4 pb-8 last:pb-0">
                    {index !== history.length - 1 && <div className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-200" />}
                    <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${index === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Truck size={17} />
                    </div>
                    <div className="min-w-0 flex-1 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{getStatusLabel(event.status)}</h3>
                        <span className="text-xs font-medium text-slate-400">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{event.description || "Shipment status updated"}</p>
                      {event.location && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <MapPin size={13} /> {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Shipment details</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">Package information</h2>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <DetailTile icon={Truck} label="Courier partner" value={shipment.courierName || "Not assigned"} />
                <DetailTile icon={Box} label="AWB / Tracking number" value={shipment.awbCode || "Not assigned"} />
                <DetailTile icon={CalendarDays} label="Estimated delivery" value={formatDate(shipment.estimatedDeliveryDate)} />
                <DetailTile icon={MapPin} label="Last known location" value={shipment.lastLocation || latestEvent?.location || "Not available"} />
                <DetailTile icon={Package} label="Shipment status" value={getStatusLabel(currentStatus)} />
              </div>
              {shipment.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Open courier tracking <ExternalLink size={16} />
                </a>
              )}
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Latest location</p>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900">{shipment.lastLocation || latestEvent?.location || "Location not available"}</h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {latestEvent
                  ? `${getStatusLabel(latestEvent.status)} · ${formatDate(latestEvent.timestamp)}`
                  : "Location details will appear when the courier shares an update."}
              </p>
              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Location is based on courier tracking updates. It may not represent continuous live GPS movement.
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 rounded-[24px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <h3 className="font-extrabold text-slate-900">Need anything else?</h3>
            <p className="mt-1 text-sm text-slate-500">Continue shopping or view all your orders.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/account/orders" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
              <ShoppingBag size={16} /> My orders
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600">
              Continue shopping <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <ProtectedRoute>
      <TrackingContent />
    </ProtectedRoute>
  );
}
