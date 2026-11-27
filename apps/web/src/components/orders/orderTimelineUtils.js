export const ORDER_TIMELINE_STAGES = [
  {
    key: "ORDER_PLACED",
    title: "Order Placed",
    description: "We received your order.",
  },
  {
    key: "ORDER_CONFIRMED",
    title: "Order Confirmed",
    description: "Your order has been verified and confirmed.",
  },
  {
    key: "PROCESSING",
    title: "Processing",
    description: "Your items are being prepared and packed.",
  },
  {
    key: "PICKUP_SCHEDULED",
    title: "Pickup Scheduled",
    description: "Courier pickup has been scheduled.",
  },
  {
    key: "SHIPPED",
    title: "Shipped",
    description: "Package has been handed over to the courier.",
  },
  {
    key: "IN_TRANSIT",
    title: "In Transit",
    description: "Shipment is moving toward your destination hub.",
  },
  {
    key: "OUT_FOR_DELIVERY",
    title: "Out for Delivery",
    description: "Courier partner is on the way to deliver your package.",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "Package has been delivered.",
  },
];

export const RETURN_WINDOW_DAYS = 7;

export const ORDER_CANCELLATION_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Need to change shipping address or payment method",
  "No longer needed",
  "Other",
];

export const RETURN_REASONS = [
  { value: "Damaged", label: "Product arrived damaged" },
  { value: "Defective", label: "Product is defective or not working" },
  { value: "WrongItem", label: "Received wrong item or variant" },
  { value: "NotAsDescribed", label: "Item does not match product description" },
  { value: "MissingParts", label: "Accessories or parts are missing" },
  { value: "Other", label: "Other issue" },
];

export const normalizeStatusToken = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

export const formatCurrencyINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export const formatDateShort = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatLabelText = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
};

export const getOrderThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return "";
  if (typeof thumbnail === "object") return thumbnail.url || "";

  if (typeof thumbnail === "string") {
    const trimmed = thumbnail.trim();
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
      return trimmed;
    }
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === "object" ? parsed.url || "" : "";
    } catch {
      return "";
    }
  }
  return "";
};

export const getVariantAttributes = (value) => {
  if (!value) return [];
  if (value instanceof Map) return Array.from(value.entries());
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.entries(value);
  return [];
};

export const getOrderStatusBadgeClasses = (status) => {
  const token = normalizeStatusToken(status);

  if (["DELIVERED", "COMPLETED", "PAID"].includes(token)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (
    token.includes("CANCEL") ||
    token.includes("FAIL") ||
    token.includes("RTO") ||
    token.includes("LOST") ||
    token === "REFUNDED"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (token.includes("RETURN") || token === "PARTIALLYREFUNDED" || token === "PARTIALLY REFUNDED") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }
  if (
    [
      "CONFIRMED",
      "PROCESSING",
      "NEW",
      "PICKUP SCHEDULED",
      "PICKUP REQUESTED",
      "PICKED UP",
      "SHIPPED",
      "IN TRANSIT",
      "OUT FOR DELIVERY",
    ].includes(token)
  ) {
    return "border-[#0755E9]/25 bg-[#EFF6FF] text-[#0755E9]";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const canCancelOrderStatus = (orderStatus) =>
  ["Pending", "Confirmed"].includes(String(orderStatus || ""));

const DISPATCHED_SHIPMENT_TOKENS = new Set([
  "PICKUP SCHEDULED",
  "PICKED UP",
  "IN TRANSIT",
  "OUT FOR DELIVERY",
  "DELIVERED",
]);

export const canCancelOrder = (order) => {
  if (!order) return false;
  if (order.cancellable === false) return false;
  if (!canCancelOrderStatus(order.orderStatus)) return false;

  const shipment = order.shipment || {};
  const shipmentStatus = normalizeStatusToken(shipment.currentStatus);

  if (
    shipment.shippedAt ||
    shipment.pickupScheduledAt ||
    shipment.deliveredAt ||
    shipment.awbCode ||
    DISPATCHED_SHIPMENT_TOKENS.has(shipmentStatus)
  ) {
    return false;
  }

  return true;
};

export const getRefundStatusMeta = (
  refundStatus,
  paymentStatus = "",
  paymentMethod = "",
) => {
  const normalizedRefund = String(refundStatus || "").toUpperCase();
  const normalizedPayment = String(paymentStatus || "").toLowerCase();
  const isCOD = String(paymentMethod || "").toUpperCase() === "COD";

  if (normalizedRefund === "SUCCESS" || normalizedPayment === "refunded") {
    return {
      label: "Refund Completed",
      badgeClasses: "border-emerald-200 bg-emerald-50 text-emerald-700",
      tone: "success",
      description:
        "Your refund has been processed and credited to your original payment method.",
    };
  }

  if (normalizedRefund === "PROCESSING") {
    return {
      label: "Refund Processing",
      badgeClasses: "border-[#0755E9]/25 bg-[#EFF6FF] text-[#0755E9]",
      tone: "processing",
      description:
        "Razorpay has received the refund request. Bank settlement usually completes within 5–7 business days.",
    };
  }

  if (normalizedRefund === "PENDING") {
    return {
      label: "Refund Pending",
      badgeClasses: "border-amber-200 bg-amber-50 text-amber-800",
      tone: "pending",
      description:
        "Your order cancellation refund has been queued and is awaiting gateway processing.",
    };
  }

  if (normalizedRefund === "RECONCILIATION_REQUIRED") {
    return {
      label: "Under Verification",
      badgeClasses: "border-orange-200 bg-orange-50 text-orange-700",
      tone: "warning",
      description:
        "Refund gateway confirmation is being verified by our support team.",
    };
  }

  if (normalizedRefund === "FAILED") {
    return {
      label: "Refund Failed",
      badgeClasses: "border-red-200 bg-red-50 text-red-700",
      tone: "failed",
      description:
        "Automatic refund could not be completed. Our team can re-initiate it cleanly.",
    };
  }

  if (normalizedPayment === "partiallyrefunded") {
    return {
      label: "Partially Refunded",
      badgeClasses: "border-orange-200 bg-orange-50 text-orange-700",
      tone: "warning",
      description:
        "Part of this order amount has already been refunded.",
    };
  }

  return {
    label:
      isCOD && normalizedPayment !== "paid"
        ? "No Payment Charged"
        : "No Refund Required",
    badgeClasses: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
    tone: "neutral",
    description:
      isCOD && normalizedPayment !== "paid"
        ? "No online payment was collected for this Cash on Delivery order."
        : "No payment capture requires refund for this cancelled order.",
  };
};

export const getReturnEligibility = (order) => {
  if (!order || order.orderStatus !== "Delivered") {
    return { eligible: false, deadline: null, reason: "" };
  }

  if (!order.deliveredAt) {
    return {
      eligible: false,
      deadline: null,
      reason: "Delivery date is not recorded yet.",
    };
  }

  const deliveredMs = new Date(order.deliveredAt).getTime();
  if (Number.isNaN(deliveredMs)) {
    return { eligible: false, deadline: null, reason: "" };
  }

  const deadlineDate = new Date(
    deliveredMs + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
  const eligible = Date.now() <= deadlineDate.getTime();

  return {
    eligible,
    deadline: deadlineDate,
    reason: eligible
      ? `Eligible for return within ${RETURN_WINDOW_DAYS} days of delivery (until ${formatDateShort(deadlineDate)}).`
      : `The ${RETURN_WINDOW_DAYS}-day return window closed on ${formatDateShort(deadlineDate)}.`,
  };
};

export const isTerminalExceptionStatus = (orderStatus, shipmentStatus) => {
  const orderToken = normalizeStatusToken(orderStatus);
  const shipToken = normalizeStatusToken(shipmentStatus);

  if (orderToken === "CANCELLED") {
    return { isTerminal: true, kind: "cancelled", label: "Cancelled" };
  }

  if (
    shipToken.includes("CANCEL") ||
    shipToken.includes("FAIL") ||
    shipToken.includes("UNDELIVERED") ||
    shipToken.includes("LOST")
  ) {
    return {
      isTerminal: true,
      kind: shipToken.includes("CANCEL") ? "cancelled" : "failed",
      label: formatLabelText(shipmentStatus) || "Delivery Exception",
    };
  }

  if (shipToken.includes("RTO") || shipToken.includes("RETURN")) {
    return {
      isTerminal: true,
      kind: "returned",
      label: formatLabelText(shipmentStatus) || "Returned to Origin",
    };
  }

  return { isTerminal: false, kind: "", label: "" };
};

const ORDER_STATUS_TO_STAGE = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 4,
  DELIVERED: 7,
};

const SHIPMENT_STATUS_TO_STAGE = {
  PENDING: -1,
  NEW: 2,
  "PICKUP REQUESTED": 3,
  "PICKUP SCHEDULED": 3,
  "PICKED UP": 4,
  SHIPPED: 4,
  "IN TRANSIT": 5,
  "OUT FOR DELIVERY": 6,
  DELIVERED: 7,
};

export const sortEventsChronologically = (events = []) => {
  if (!Array.isArray(events)) return [];
  return [...events]
    .map((event, originalIndex) => ({ event, originalIndex }))
    .sort((a, b) => {
      const aTime = new Date(
        a.event?.timestamp || a.event?.date || a.event?.createdAt || 0
      ).getTime();
      const bTime = new Date(
        b.event?.timestamp || b.event?.date || b.event?.createdAt || 0
      ).getTime();

      const aValid = Number.isFinite(aTime) && aTime > 0;
      const bValid = Number.isFinite(bTime) && bTime > 0;

      if (aValid && bValid && aTime !== bTime) {
        return aTime - bTime;
      }
      return a.originalIndex - b.originalIndex;
    })
    .map((entry) => entry.event);
};

export const resolveOrderTimeline = ({
  orderStatus,
  orderStatusHistory = [],
  createdAt,
  deliveredAt,
  cancelledAt,
  shipment = {},
}) => {
  const safeOrderHistory = sortEventsChronologically(orderStatusHistory);
  const safeTrackingHistory = sortEventsChronologically(
    shipment?.trackingHistory || []
  );

  const stageEvidence = new Map();

  const recordStage = (stageIndex, data) => {
    if (stageIndex < 0 || stageIndex >= ORDER_TIMELINE_STAGES.length) return;
    const existing = stageEvidence.get(stageIndex) || {};
    stageEvidence.set(stageIndex, {
      timestamp: existing.timestamp || data.timestamp || null,
      location: existing.location || data.location || "",
      note: existing.note || data.note || "",
    });
  };

  if (createdAt) {
    recordStage(0, { timestamp: createdAt, note: "Order placed" });
  }

  for (const entry of safeOrderHistory) {
    const token = normalizeStatusToken(entry?.status);
    const idx = ORDER_STATUS_TO_STAGE[token];
    if (idx !== undefined) {
      recordStage(idx, {
        timestamp: entry.timestamp || entry.createdAt || null,
        note: entry.note || "",
      });
    }
  }

  for (const event of safeTrackingHistory) {
    const token = normalizeStatusToken(event?.status || event?.event);
    const idx = SHIPMENT_STATUS_TO_STAGE[token];
    if (idx !== undefined && idx >= 0) {
      recordStage(idx, {
        timestamp:
          event.timestamp || event.date || event.createdAt || event.updatedAt || null,
        location: event.location || "",
        note: event.description || "",
      });
    }
  }

  if (shipment?.pickupScheduledAt) {
    recordStage(3, { timestamp: shipment.pickupScheduledAt });
  }
  if (shipment?.shippedAt) {
    recordStage(4, { timestamp: shipment.shippedAt });
  }
  if (shipment?.deliveredAt || deliveredAt) {
    recordStage(7, { timestamp: shipment?.deliveredAt || deliveredAt });
  }

  const orderIdx =
    ORDER_STATUS_TO_STAGE[normalizeStatusToken(orderStatus)] ?? -1;
  const shipmentIdx =
    SHIPMENT_STATUS_TO_STAGE[normalizeStatusToken(shipment?.currentStatus)] ?? -1;

  const terminal = isTerminalExceptionStatus(
    orderStatus,
    shipment?.currentStatus
  );

  let highestEvidenceIdx = -1;
  for (const key of stageEvidence.keys()) {
    if (key > highestEvidenceIdx) highestEvidenceIdx = key;
  }

  const activeStageIndex = terminal.isTerminal
    ? Math.max(highestEvidenceIdx, shipmentIdx)
    : Math.max(0, orderIdx, shipmentIdx, highestEvidenceIdx);

  const stages = ORDER_TIMELINE_STAGES.map((stage, index) => {
    const evidence = stageEvidence.get(index) || null;
    const completed =
      !terminal.isTerminal
        ? index <= activeStageIndex
        : Boolean(evidence) || index <= activeStageIndex;
    const isCurrent = !terminal.isTerminal && index === activeStageIndex;

    return {
      ...stage,
      index,
      completed,
      isCurrent,
      timestamp: evidence?.timestamp || null,
      location: evidence?.location || "",
      note: evidence?.note || "",
    };
  });

  const cancelEntry = [...safeOrderHistory]
    .reverse()
    .find((entry) => normalizeStatusToken(entry?.status) === "CANCELLED");

  const terminalTrackingEntry = [...safeTrackingHistory]
    .reverse()
    .find((event) => {
      const token = normalizeStatusToken(event?.status || event?.event);
      return (
        token.includes("CANCEL") ||
        token.includes("FAIL") ||
        token.includes("RTO") ||
        token.includes("RETURN") ||
        token.includes("UNDELIVERED")
      );
    });

  const terminalTimestamp =
    cancelledAt ||
    cancelEntry?.timestamp ||
    terminalTrackingEntry?.timestamp ||
    terminalTrackingEntry?.date ||
    null;

  const terminalNote =
    cancelEntry?.note ||
    terminalTrackingEntry?.description ||
    "";

  const terminalLocation = terminalTrackingEntry?.location || "";

  const progressPercent = terminal.isTerminal
    ? Math.round(
        (Math.max(0, activeStageIndex + 1) / ORDER_TIMELINE_STAGES.length) * 100
      )
    : Math.round(
        ((activeStageIndex + 1) / ORDER_TIMELINE_STAGES.length) * 100
      );

  return {
    stages,
    activeStageIndex,
    progressPercent,
    terminal,
    terminalTimestamp,
    terminalNote,
    terminalLocation,
    chronologicalTrackingHistory: safeTrackingHistory,
    chronologicalOrderHistory: safeOrderHistory,
  };
};

