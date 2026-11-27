"use client";

import {
  ShoppingBag,
  BadgeCheck,
  Package,
  CalendarClock,
  Truck,
  Route,
  Navigation,
  House,
  Clock3,
  MapPin,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import { formatDateTime } from "@/components/orders/orderTimelineUtils";

const STAGE_ICONS = {
  ORDER_PLACED: ShoppingBag,
  ORDER_CONFIRMED: BadgeCheck,
  PROCESSING: Package,
  PICKUP_SCHEDULED: CalendarClock,
  SHIPPED: Truck,
  IN_TRANSIT: Route,
  OUT_FOR_DELIVERY: Navigation,
  DELIVERED: House,
};

export default function OrderStatusTimeline({
  timeline,
  compact = false,
}) {
  if (!timeline) return null;

  const {
    stages,
    terminal,
    terminalTimestamp,
    terminalNote,
    terminalLocation,
  } = timeline;

  const visibleStages = terminal.isTerminal
    ? stages.filter((stage) => stage.completed)
    : stages;

  return (
    <div className="space-y-0">
      {visibleStages.map((stage, idx) => {
        const Icon = STAGE_ICONS[stage.key] || Package;
        const isLastItem =
          !terminal.isTerminal && idx === visibleStages.length - 1;

        const isCompleted = stage.completed;
        const isCurrent = stage.isCurrent;
        const nextStage = visibleStages[idx + 1];
        const connectorBlue =
          isCompleted && (nextStage ? nextStage.completed : terminal.isTerminal);

        return (
          <div key={stage.key} className="relative flex gap-3.5 sm:gap-5">
            {!isLastItem && (
              <div
                aria-hidden="true"
                className={`absolute left-[19px] top-10 h-[calc(100%-26px)] w-0.5 ${
                  connectorBlue ? "bg-[#0755E9]" : "bg-[#E2E8F0]"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                isCurrent
                  ? "border-[#0755E9] bg-[#0755E9] text-white ring-4 ring-[#EFF6FF]"
                  : isCompleted
                    ? "border-[#0755E9]/20 bg-[#EFF6FF] text-[#0755E9]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]/60"
              }`}
            >
              <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
            </div>

            <div
              className={`mb-4 min-w-0 flex-1 rounded-2xl border p-3.5 sm:p-4 ${
                isCurrent
                  ? "border-[#0755E9]/35 bg-[#EFF6FF]/65"
                  : isCompleted
                    ? "border-[#E2E8F0] bg-white"
                    : "border-[#E2E8F0]/75 bg-[#F8FAFC]/70"
              } ${compact ? "mb-3" : "mb-4"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm font-bold ${
                      isCompleted ? "text-[#101828]" : "text-[#64748B]"
                    }`}
                  >
                    {stage.title}
                  </h3>

                  <p className="mt-0.5 text-xs leading-5 text-[#64748B]">
                    {stage.note || stage.description}
                  </p>
                </div>

                {isCurrent ? (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                      stage.key === "DELIVERED"
                        ? "bg-emerald-600"
                        : "bg-[#0755E9]"
                    }`}
                  >
                    {stage.key === "DELIVERED" ? "Delivered" : "Current"}
                  </span>
                ) : isCompleted ? (
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Completed
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
                    Pending
                  </span>
                )}
              </div>

              {(stage.timestamp || stage.location) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#E2E8F0]/70 pt-2.5 text-[11px] font-medium text-[#64748B]">
                  {stage.timestamp && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={12} aria-hidden="true" />
                      {formatDateTime(stage.timestamp)}
                    </span>
                  )}

                  {stage.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} aria-hidden="true" />
                      {stage.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {terminal.isTerminal && (
        <div className="relative flex gap-3.5 sm:gap-5">
          <div
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              terminal.kind === "returned"
                ? "border-orange-300 bg-orange-50 text-orange-700 ring-4 ring-orange-50"
                : "border-red-300 bg-red-50 text-red-600 ring-4 ring-red-50"
            }`}
          >
            {terminal.kind === "returned" ? (
              <RotateCcw size={18} strokeWidth={2.1} aria-hidden="true" />
            ) : terminal.kind === "failed" ? (
              <AlertTriangle size={18} strokeWidth={2.1} aria-hidden="true" />
            ) : (
              <XCircle size={18} strokeWidth={2.1} aria-hidden="true" />
            )}
          </div>

          <div
            className={`min-w-0 flex-1 rounded-2xl border p-3.5 sm:p-4 ${
              terminal.kind === "returned"
                ? "border-orange-200 bg-orange-50/70"
                : "border-red-200 bg-red-50/70"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-sm font-bold ${
                    terminal.kind === "returned"
                      ? "text-orange-900"
                      : "text-red-900"
                  }`}
                >
                  {terminal.label}
                </h3>

                <p
                  className={`mt-0.5 text-xs leading-5 ${
                    terminal.kind === "returned"
                      ? "text-orange-700"
                      : "text-red-700"
                  }`}
                >
                  {terminalNote ||
                    (terminal.kind === "returned"
                      ? "Shipment is being returned or has been returned to origin."
                      : terminal.kind === "failed"
                        ? "Delivery could not be completed. See shipment updates or contact support."
                        : "This order has been cancelled and will not be shipped.")}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                  terminal.kind === "returned" ? "bg-orange-600" : "bg-red-600"
                }`}
              >
                {terminal.label}
              </span>
            </div>

            {(terminalTimestamp || terminalLocation) && (
              <div
                className={`mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5 text-[11px] font-medium ${
                  terminal.kind === "returned"
                    ? "border-orange-200/80 text-orange-700"
                    : "border-red-200/80 text-red-700"
                }`}
              >
                {terminalTimestamp && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={12} aria-hidden="true" />
                    {formatDateTime(terminalTimestamp)}
                  </span>
                )}
                {terminalLocation && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} aria-hidden="true" />
                    {terminalLocation}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
