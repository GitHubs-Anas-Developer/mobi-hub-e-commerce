"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Descriptions,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
} from "antd";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import adminOrderService from "@/services/adminOrderService";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import {
  canCancelOrder,
  getRefundStatusMeta,
} from "@/components/orders/orderTimelineUtils";

const ORDER_STATUS_FLOW = {
  Pending: ["Confirmed"],
  Confirmed: ["Processing"],
  Processing: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const ORDER_STATUS_COLORS = {
  Pending: "gold",
  Confirmed: "blue",
  Processing: "geekblue",
  Shipped: "purple",
  Delivered: "green",
  Cancelled: "red",
};

const PAYMENT_STATUS_COLORS = {
  Pending: "gold",
  Paid: "green",
  Failed: "red",
  PartiallyRefunded: "orange",
  Refunded: "default",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatLabel = (value) => {
  if (!value) return "N/A";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
};

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shipmentSaving, setShipmentSaving] = useState(false);
  const [showAdminCancelModal, setShowAdminCancelModal] = useState(false);
  const [adminCancelling, setAdminCancelling] = useState(false);
  const [adminCancelError, setAdminCancelError] = useState("");
  const [refundProcessing, setRefundProcessing] = useState(false);
  const [refundSyncing, setRefundSyncing] = useState(false);
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [refundReasonInput, setRefundReasonInput] = useState("");
  const [manualRefundConfirmed, setManualRefundConfirmed] = useState(false);

  const [shipmentForm, setShipmentForm] = useState({
    provider: "OTHER",
    shipmentId: "",
    awbCode: "",
    courierName: "",
    courierCompanyId: "",
    trackingUrl: "",
    estimatedDeliveryDate: "",
    status: "",
    description: "",
    location: "",
  });

  const applyLoadedOrder = useCallback((data) => {
    setOrder(data);
    setSelectedStatus(ORDER_STATUS_FLOW[data.orderStatus]?.[0] || "");

    const defaultRefundAmt =
      data.paymentMethod === "Online"
        ? data.paymentDetails?.remainingRefundableAmount
        : data.totalAmount;
    setRefundAmountInput(
      Number(defaultRefundAmt) > 0 ? String(defaultRefundAmt) : "",
    );
    setRefundReasonInput(data.cancellationReason || "");
    setManualRefundConfirmed(false);

    const shipment = data.shipment || {};
    const estimatedDate = shipment.estimatedDeliveryDate
      ? new Date(shipment.estimatedDeliveryDate)
      : null;

    setShipmentForm({
      provider: shipment.provider || "OTHER",
      shipmentId: shipment.shipmentId || "",
      awbCode: shipment.awbCode || "",
      courierName: shipment.courierName || "",
      courierCompanyId: shipment.courierCompanyId ?? "",
      trackingUrl: shipment.trackingUrl || "",
      estimatedDeliveryDate:
        estimatedDate && !Number.isNaN(estimatedDate.getTime())
          ? estimatedDate.toISOString().slice(0, 10)
          : "",
      status: "",
      description: "",
      location: shipment.lastLocation || "",
    });
  }, []);

  const loadOrderData = useCallback(async () => {
    const response = await adminOrderService.getOrderById(orderId);
    const data = response.data?.order;
    if (!data) throw new Error("Order details not found.");
    return data;
  }, [orderId]);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await loadOrderData();
      applyLoadedOrder(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load order details.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadOrderData, applyLoadedOrder]);

  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;

    loadOrderData()
      .then((data) => {
        if (!active) return;
        applyLoadedOrder(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load order details.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, loadOrderData, applyLoadedOrder]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !order) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await adminOrderService.updateOrderStatus(order._id, selectedStatus);
      setSuccess("Order status updated successfully.");
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update order status.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminCancelOrder = async ({
    orderId: targetId,
    reason,
    comment,
  }) => {
    try {
      setAdminCancelling(true);
      setAdminCancelError("");
      setError("");
      setSuccess("");

      await adminOrderService.cancelOrder(targetId, { reason, comment });
      setShowAdminCancelModal(false);
      setSuccess("Order cancelled and refund status updated.");
      await fetchOrder();
    } catch (err) {
      setAdminCancelError(
        err.response?.data?.message || err.message || "Unable to cancel order.",
      );
    } finally {
      setAdminCancelling(false);
    }
  };

  const handleProcessRefund = async (event) => {
    event.preventDefault();
    if (!order?._id || refundProcessing || refundSyncing) return;

    const isCOD = order.paymentMethod === "COD";

    try {
      setRefundProcessing(true);
      setError("");
      setSuccess("");

      const response = await adminOrderService.processOrderRefund({
        orderId: order._id,
        paymentId: order.paymentDetails?._id || undefined,
        reason:
          refundReasonInput.trim() ||
          order.cancellationReason ||
          "Admin processed cancellation refund",
        amount: refundAmountInput ? Number(refundAmountInput) : undefined,
        provider: isCOD ? "Manual" : "Razorpay",
        manualRefundConfirmed: isCOD ? manualRefundConfirmed : undefined,
      });

      setSuccess(response?.message || "Refund processed successfully.");
      await fetchOrder();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to process refund.",
      );
      await fetchOrder();
    } finally {
      setRefundProcessing(false);
    }
  };

  const handleSyncRefund = async () => {
    if (!order?._id || refundSyncing || refundProcessing) return;

    try {
      setRefundSyncing(true);
      setError("");
      setSuccess("");

      const response = await adminOrderService.syncOrderRefund(order._id);
      setSuccess(response?.message || "Refund synchronized with Razorpay.");
      await fetchOrder();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to sync refund status with Razorpay.",
      );
      await fetchOrder();
    } finally {
      setRefundSyncing(false);
    }
  };

  const handleShipmentUpdate = async (event) => {
    event.preventDefault();
    if (!order) return;

    if (shipmentForm.status && !shipmentForm.description.trim()) {
      setError("Tracking description is required.");
      setSuccess("");
      return;
    }

    const trackingData = { provider: shipmentForm.provider };
    [
      "shipmentId",
      "awbCode",
      "courierName",
      "trackingUrl",
      "courierCompanyId",
      "location",
    ].forEach((field) => {
      const value = shipmentForm[field];
      if (value !== "" && value !== null && value !== undefined) {
        trackingData[field] = value;
      }
    });

    if (shipmentForm.estimatedDeliveryDate) {
      const deliveryDate = new Date(
        `${shipmentForm.estimatedDeliveryDate}T00:00:00`,
      );
      if (Number.isNaN(deliveryDate.getTime())) {
        setError("Please enter a valid estimated delivery date.");
        setSuccess("");
        return;
      }
      trackingData.estimatedDeliveryDate = deliveryDate.toISOString();
    }

    if (shipmentForm.status) {
      trackingData.status = shipmentForm.status;
      trackingData.description = shipmentForm.description.trim();
    }

    try {
      setShipmentSaving(true);
      setError("");
      setSuccess("");
      await adminOrderService.updateShipmentTracking(order._id, trackingData);
      setSuccess("Shipment tracking updated successfully.");
      await fetchOrder();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update shipment tracking.",
      );
    } finally {
      setShipmentSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-sm text-[#64748B]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Order Not Found"
          backHref="/admin/orders"
          backLabel="Back to Orders"
        />
        <Alert
          type="error"
          showIcon
          title={error || "Order not found."}
          action={
            <Button size="small" onClick={fetchOrder}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const address = order.shippingAddress || {};
  const customer = order.user || {};
  const items = order.items || [];
  const shipment = order.shipment || {};
  const trackingHistory = shipment.trackingHistory || [];
  const availableStatuses = ORDER_STATUS_FLOW[order.orderStatus] || [];
  const refundStatus =
    order.refundSummary?.status || order.refundStatus || "NOT_REQUIRED";
  const refundMeta = getRefundStatusMeta(
    refundStatus,
    order.paymentStatus,
    order.paymentMethod,
  );
  const isCOD = order.paymentMethod === "COD";
  const remainingRefundable = Number(
    order.paymentDetails?.remainingRefundableAmount ?? 0,
  );
  const hasActiveAttempt =
    Array.isArray(order.refundHistory) &&
    order.refundHistory.some((r) => ["Pending", "Processing"].includes(r.status));
  const canTriggerRazorpayRefund =
    order.orderStatus === "Cancelled" &&
    !isCOD &&
    order.paymentDetails &&
    remainingRefundable > 0 &&
    !hasActiveAttempt &&
    !order.paymentDetails.refundReconciliationRequired;
  const canTriggerManualCODRefund =
    order.orderStatus === "Cancelled" &&
    isCOD &&
    order.paymentStatus === "Paid";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${formatDate(order.createdAt)}`}
        backHref="/admin/orders"
        backLabel="Back to Orders"
        badge={order.orderStatus}
        extra={
          <Space wrap>
            <Tag color={ORDER_STATUS_COLORS[order.orderStatus]}>
              Order: {order.orderStatus}
            </Tag>
            <Tag color={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
              Payment: {formatLabel(order.paymentStatus)}
            </Tag>
            <Button
              icon={
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={fetchOrder}
            >
              Refresh
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          onClose={() => setError("")}
          title={error}
        />
      )}
      {success && (
        <Alert
          type="success"
          showIcon
          closable
          onClose={() => setSuccess("")}
          title={success}
        />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Main Column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Ordered Products */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <Package size={17} className="text-[#0755E9]" />
                Ordered Products ({items.length})
              </span>
            }
          >
            <div className="divide-y divide-[#F1F5F9]">
              {items.map((item, idx) => (
                <div
                  key={`${item.product}-${item.variantId}-${idx}`}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#94A3B8]">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#101828]">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      SKU: {item.sku || "N/A"} · Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-bold text-[#101828]">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {formatCurrency(item.sellingPrice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card
              className="!border-[#E2E8F0]"
              title={
                <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                  <User size={17} className="text-[#0755E9]" />
                  Customer
                </span>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  {customer.name || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {customer.email || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                  <span className="font-mono text-xs">{customer._id}</span>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              className="!border-[#E2E8F0]"
              title={
                <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                  <MapPin size={17} className="text-[#0755E9]" />
                  Shipping Address
                </span>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Recipient">
                  {address.fullName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {address.phone || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {[
                    address.addressLine1,
                    address.addressLine2,
                    address.city,
                    address.state,
                    address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Shipment Management */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <Truck size={17} className="text-[#0755E9]" />
                Shipment & Tracking Update
              </span>
            }
          >
            <form onSubmit={handleShipmentUpdate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    Courier Provider
                  </label>
                  <Select
                    className="w-full"
                    value={shipmentForm.provider}
                    disabled={shipmentSaving}
                    onChange={(value) =>
                      setShipmentForm((prev) => ({ ...prev, provider: value }))
                    }
                    options={[
                      { value: "SHIPROCKET", label: "Shiprocket" },
                      { value: "SELF", label: "Self Shipping" },
                      { value: "OTHER", label: "Other" },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    Courier Name
                  </label>
                  <Input
                    value={shipmentForm.courierName}
                    onChange={(e) =>
                      setShipmentForm((p) => ({
                        ...p,
                        courierName: e.target.value,
                      }))
                    }
                    disabled={shipmentSaving}
                    placeholder="e.g. Delhivery"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    Shipment ID
                  </label>
                  <Input
                    value={shipmentForm.shipmentId}
                    onChange={(e) =>
                      setShipmentForm((p) => ({
                        ...p,
                        shipmentId: e.target.value,
                      }))
                    }
                    disabled={shipmentSaving}
                    placeholder="Shipment ID"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    AWB Code
                  </label>
                  <Input
                    value={shipmentForm.awbCode}
                    onChange={(e) =>
                      setShipmentForm((p) => ({
                        ...p,
                        awbCode: e.target.value,
                      }))
                    }
                    disabled={shipmentSaving}
                    placeholder="AWB Tracking #"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    Tracking URL
                  </label>
                  <Input
                    value={shipmentForm.trackingUrl}
                    onChange={(e) =>
                      setShipmentForm((p) => ({
                        ...p,
                        trackingUrl: e.target.value,
                      }))
                    }
                    disabled={shipmentSaving}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    Estimated Delivery
                  </label>
                  <DatePicker
                    className="w-full"
                    disabled={shipmentSaving}
                    onChange={(d) =>
                      setShipmentForm((p) => ({
                        ...p,
                        estimatedDeliveryDate: d ? d.format("YYYY-MM-DD") : "",
                      }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                      Next Tracking Status
                    </label>
                    <Select
                      className="w-full"
                      value={shipmentForm.status}
                      disabled={shipmentSaving}
                      onChange={(value) =>
                        setShipmentForm((p) => ({ ...p, status: value }))
                      }
                      options={[
                        { value: "", label: "Shipment details only" },
                        { value: "NEW", label: "New" },
                        { value: "PICKUP SCHEDULED", label: "Pickup Scheduled" },
                        { value: "PICKED UP", label: "Picked Up" },
                        { value: "IN TRANSIT", label: "In Transit" },
                        { value: "OUT FOR DELIVERY", label: "Out for Delivery" },
                        { value: "DELIVERED", label: "Delivered" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                      Location
                    </label>
                    <Input
                      value={shipmentForm.location}
                      onChange={(e) =>
                        setShipmentForm((p) => ({
                          ...p,
                          location: e.target.value,
                        }))
                      }
                      disabled={shipmentSaving}
                      placeholder="City / Hub"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
                    Status Description
                  </label>
                  <Input.TextArea
                    rows={2}
                    value={shipmentForm.description}
                    onChange={(e) =>
                      setShipmentForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    disabled={shipmentSaving}
                    placeholder="Enter shipment event note..."
                  />
                </div>
              </div>

              <Button
                htmlType="submit"
                type="primary"
                loading={shipmentSaving}
                icon={<Save size={15} />}
                block
              >
                Save Shipment & Tracking Update
              </Button>
            </form>
          </Card>

          {/* Tracking History */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <Clock size={17} className="text-[#0755E9]" />
                Tracking History
              </span>
            }
          >
            {trackingHistory.length > 0 ? (
              <Timeline
                items={trackingHistory.map((ev) => ({
                  color: ev.status === "DELIVERED" ? "green" : "blue",
                  content: (
                    <div>
                      <p className="font-semibold text-[#101828]">
                        {formatLabel(ev.status)}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {ev.description || "No description"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                        {ev.location ? `${ev.location} · ` : ""}
                        {formatDate(ev.timestamp)}
                      </p>
                    </div>
                  ),
                }))}
              />
            ) : (
              <p className="text-sm text-[#64748B]">
                No courier tracking events yet.
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Update Order Status + Admin Cancel */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <Truck size={17} className="text-[#0755E9]" />
                Fulfillment Control
              </span>
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Current Status</span>
              <Tag color={ORDER_STATUS_COLORS[order.orderStatus]}>
                {order.orderStatus}
              </Tag>
            </div>

            {availableStatuses.length > 0 ? (
              <div className="space-y-3">
                <Select
                  className="w-full"
                  value={selectedStatus}
                  disabled={saving}
                  onChange={setSelectedStatus}
                  options={availableStatuses.map((s) => ({ value: s, label: s }))}
                />
                <Button
                  type="primary"
                  block
                  loading={saving}
                  icon={<CheckCircle2 size={15} />}
                  onClick={handleStatusUpdate}
                >
                  Advance Order Status
                </Button>
              </div>
            ) : (
              <p className="rounded-lg bg-[#F8FAFC] p-3 text-xs text-[#64748B]">
                This order has reached its final status.
              </p>
            )}

            {canCancelOrder(order) && (
              <Button
                danger
                block
                className="mt-3"
                icon={<XCircle size={15} />}
                disabled={saving || adminCancelling}
                onClick={() => {
                  setAdminCancelError("");
                  setShowAdminCancelModal(true);
                }}
              >
                Cancel Order (Admin)
              </Button>
            )}
          </Card>

          {/* Payment Details */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <CreditCard size={17} className="text-[#0755E9]" />
                Payment & Gateway
              </span>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Method">
                {order.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                  {formatLabel(order.paymentStatus)}
                </Tag>
              </Descriptions.Item>
              {order.paymentDetails && (
                <>
                  <Descriptions.Item label="Gateway">
                    {formatLabel(order.paymentDetails.status)}
                  </Descriptions.Item>
                  {order.paymentDetails.razorpayPaymentId && (
                    <Descriptions.Item label="Razorpay Pay ID">
                      <span className="break-all font-mono text-xs">
                        {order.paymentDetails.razorpayPaymentId}
                      </span>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Refunded">
                    {formatCurrency(order.paymentDetails.refundedAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reserved Pending">
                    {formatCurrency(order.paymentDetails.reservedRefundAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Remaining Refundable">
                    <strong>
                      {formatCurrency(
                        order.paymentDetails.remainingRefundableAmount,
                      )}
                    </strong>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            {order.paymentDetails?.refundReconciliationRequired && (
              <Alert
                type="warning"
                showIcon
                icon={<ShieldAlert size={16} />}
                className="mt-3"
                title="Manual Reconciliation Flagged"
                description={order.paymentDetails.refundReconciliationReason}
              />
            )}
          </Card>

          {/* Cancellation & Refund Management */}
          {(order.orderStatus === "Cancelled" ||
            (Array.isArray(order.refundHistory) &&
              order.refundHistory.length > 0)) && (
            <Card
              className="!border-[#E2E8F0]"
              title={
                <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                  <RotateCcw size={17} className="text-[#0755E9]" />
                  Cancellation & Refund
                </span>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Refund Status</span>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${refundMeta.badgeClasses}`}
                >
                  {refundMeta.label}
                </span>
              </div>

              <Descriptions column={1} size="small">
                {order.orderStatus === "Cancelled" && (
                  <>
                    <Descriptions.Item label="Reason">
                      {order.cancellationReason || "Not specified"}
                    </Descriptions.Item>
                    {order.cancellationComment && (
                      <Descriptions.Item label="Comment">
                        {order.cancellationComment}
                      </Descriptions.Item>
                    )}
                    {order.cancelledBy && (
                      <Descriptions.Item label="Cancelled By">
                        {order.cancelledBy}
                      </Descriptions.Item>
                    )}
                  </>
                )}
                {order.refundSummary?.gatewayRefundId && (
                  <Descriptions.Item label="Gateway Refund ID">
                    <span className="break-all font-mono text-xs">
                      {order.refundSummary.gatewayRefundId}
                    </span>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {order.refundSummary?.failureReason && (
                <Alert
                  type="error"
                  showIcon
                  className="mt-3"
                  title={order.refundSummary.failureReason}
                />
              )}

              {!isCOD &&
                order.orderStatus === "Cancelled" &&
                (hasActiveAttempt ||
                  order.paymentDetails?.refundReconciliationRequired ||
                  ["PENDING", "PROCESSING", "RECONCILIATION_REQUIRED"].includes(
                    refundStatus,
                  )) &&
                Array.isArray(order.refundHistory) &&
                order.refundHistory.length > 0 && (
                  <Button
                    block
                    className="mt-4"
                    icon={
                      <RefreshCw
                        size={14}
                        className={refundSyncing ? "animate-spin" : ""}
                      />
                    }
                    loading={refundSyncing}
                    disabled={refundProcessing}
                    onClick={handleSyncRefund}
                  >
                    Sync Refund Status with Razorpay
                  </Button>
                )}

              {(canTriggerRazorpayRefund || canTriggerManualCODRefund) && (
                <form
                  onSubmit={handleProcessRefund}
                  className="mt-4 space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    {canTriggerManualCODRefund
                      ? "Record Manual COD Refund"
                      : "Initiate / Retry Razorpay Refund"}
                  </p>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">
                      Refund Amount (INR)
                    </label>
                    <InputNumber
                      className="!w-full"
                      min={0.01}
                      max={
                        canTriggerRazorpayRefund
                          ? remainingRefundable
                          : order.totalAmount
                      }
                      step={1}
                      value={
                        refundAmountInput ? Number(refundAmountInput) : null
                      }
                      onChange={(val) =>
                        setRefundAmountInput(val !== null ? String(val) : "")
                      }
                      disabled={refundProcessing || refundSyncing}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">
                      Reason
                    </label>
                    <Input
                      value={refundReasonInput}
                      onChange={(e) => setRefundReasonInput(e.target.value)}
                      placeholder="Refund note"
                      disabled={refundProcessing || refundSyncing}
                    />
                  </div>

                  {canTriggerManualCODRefund && (
                    <Checkbox
                      checked={manualRefundConfirmed}
                      onChange={(e) =>
                        setManualRefundConfirmed(e.target.checked)
                      }
                    >
                      <span className="text-xs text-[#101828]">
                        I confirm manual COD transfer has been sent to the
                        customer
                      </span>
                    </Checkbox>
                  )}

                  <Button
                    htmlType="submit"
                    type="primary"
                    block
                    icon={<RotateCcw size={14} />}
                    loading={refundProcessing}
                    disabled={
                      refundSyncing ||
                      (canTriggerManualCODRefund && !manualRefundConfirmed)
                    }
                  >
                    {canTriggerManualCODRefund
                      ? "Confirm Manual COD Refund"
                      : "Process Razorpay Refund"}
                  </Button>
                </form>
              )}

              {Array.isArray(order.refundHistory) &&
                order.refundHistory.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      Refund Audit Attempts ({order.refundHistory.length})
                    </p>
                    {order.refundHistory.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-[#101828]">
                          <span>
                            #{item.attempt} · {item.provider} ({item.referenceType})
                          </span>
                          <span className="text-[#0755E9]">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <p className="mt-1 text-[#64748B]">
                          Status: <strong>{item.status}</strong> ·{" "}
                          {formatDate(item.createdAt)}
                        </p>
                        {item.providerRefundId && (
                          <p className="mt-0.5 break-all font-mono text-[11px]">
                            ID: {item.providerRefundId}
                          </p>
                        )}
                        {item.failureReason && (
                          <p className="mt-0.5 text-red-600">
                            {item.failureReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </Card>
          )}

          {/* Price Summary */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <CreditCard size={17} className="text-[#0755E9]" />
                Price Summary
              </span>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Subtotal">
                {formatCurrency(order.subtotal)}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping">
                {formatCurrency(order.shippingFee)}
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                -{formatCurrency(order.discount)}
              </Descriptions.Item>
              {order.coupon?.code && (
                <Descriptions.Item label="Coupon">
                  <Tag color="blue">{order.coupon.code}</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Grand Total">
                <strong className="text-base text-[#0755E9]">
                  {formatCurrency(order.totalAmount)}
                </strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order Timeline */}
          <Card
            className="!border-[#E2E8F0]"
            title={
              <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
                <CalendarDays size={17} className="text-[#0755E9]" />
                Milestones
              </span>
            }
          >
            <Timeline
              items={[
                {
                  color: "blue",
                  content: (
                    <div>
                      <p className="font-semibold text-[#101828]">Order Placed</p>
                      <p className="text-xs text-[#64748B]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  ),
                },
                ...(order.deliveredAt
                  ? [
                      {
                        color: "green",
                        content: (
                          <div>
                            <p className="font-semibold text-[#101828]">
                              Delivered
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {formatDate(order.deliveredAt)}
                            </p>
                          </div>
                        ),
                      },
                    ]
                  : []),
                ...(order.cancelledAt
                  ? [
                      {
                        color: "red",
                        icon: <AlertCircle size={14} />,
                        content: (
                          <div>
                            <p className="font-semibold text-[#101828]">
                              Cancelled
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {formatDate(order.cancelledAt)}
                            </p>
                          </div>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Card>
        </div>
      </div>

      <CancelOrderModal
        key={order?._id || "admin-cancel-modal"}
        order={order}
        open={showAdminCancelModal}
        loading={adminCancelling}
        error={adminCancelError}
        title="Cancel Order (Admin)"
        submitLabel="Confirm Admin Cancellation"
        onClose={() => {
          setShowAdminCancelModal(false);
          setAdminCancelError("");
        }}
        onConfirm={handleAdminCancelOrder}
      />
    </div>
  );
}
