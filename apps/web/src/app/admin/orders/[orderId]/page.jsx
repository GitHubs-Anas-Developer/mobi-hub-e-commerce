
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  CalendarDays,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react";

import adminOrderService from "@/services/adminOrderService";

const ORDER_STATUS_FLOW = {
  Pending: ["Confirmed"],
  Confirmed: ["Processing"],
  Processing: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const orderStatusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Shipped: "bg-purple-50 text-purple-700 border-purple-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const paymentStatusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Paid: "bg-green-50 text-green-700",
  Failed: "bg-red-50 text-red-700",
  PartiallyRefunded: "bg-orange-50 text-orange-700",
  Refunded: "bg-slate-100 text-slate-700",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">
        {value ?? "N/A"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
        <Icon size={19} className="text-blue-600" />
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>

      {children}
    </section>
  );
}

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

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminOrderService.getOrderById(orderId);
      const data = response.data?.order;

      if (!data) {
        throw new Error("Order details not found.");
      }

      setOrder(data);
      setSelectedStatus(
        ORDER_STATUS_FLOW[data.orderStatus]?.[0] || "",
      );

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
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load order details.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !order) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await adminOrderService.updateOrderStatus(
        order._id,
        selectedStatus,
      );

      setSuccess("Order status updated successfully.");

      await fetchOrder();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update order status.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleShipmentChange = (event) => {
    const { name, value } = event.target;

    setShipmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShipmentUpdate = async (event) => {
    event.preventDefault();

    if (!order) return;

    if (shipmentForm.status && !shipmentForm.description.trim()) {
      setError("Tracking description is required.");
      setSuccess("");
      return;
    }

    const trackingData = {
      provider: shipmentForm.provider,
    };

    const optionalFields = [
      "shipmentId",
      "awbCode",
      "courierName",
      "trackingUrl",
      "courierCompanyId",
      "location",
    ];

    optionalFields.forEach((field) => {
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

      await adminOrderService.updateShipmentTracking(
        order._id,
        trackingData,
      );

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

  const address = order?.shippingAddress || {};
  const customer = order?.user || {};
  const items = order?.items || [];
  const shipment = order?.shipment || {};
  const trackingHistory = shipment.trackingHistory || [];

  const availableStatuses =
    ORDER_STATUS_FLOW[order?.orderStatus] || [];

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center gap-3 text-slate-500">
        <Loader2 size={24} className="animate-spin" />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <Link
          href="/admin/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Order Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Order #{order.orderNumber || order._id}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOrder}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Package size={17} />
              Order Status
            </div>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                orderStatusStyles[order.orderStatus] ||
                "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {order.orderStatus}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <CreditCard size={17} />
              Payment Status
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                paymentStatusStyles[order.paymentStatus] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {formatLabel(order.paymentStatus)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Package size={17} />
              Total Items
            </div>

            <p className="text-2xl font-bold text-slate-900">
              {items.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <CreditCard size={17} />
              Order Total
            </div>

            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Products */}
            <SectionCard title="Order Items" icon={Package}>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item._id || `${item.productName}-${index}`}
                    className="flex flex-col gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.productName || "Product"}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.productName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {item.sku || "N/A"}
                      </p>

                      {item.attributes &&
                        Object.keys(item.attributes).length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            {Object.entries(item.attributes)
                              .map(
                                ([key, value]) =>
                                  `${formatLabel(key)}: ${value}`,
                              )
                              .join(" · ")}
                          </p>
                        )}

                      <p className="mt-2 text-sm text-slate-600">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrency(item.sellingPrice)} each
                      </p>

                      {Number(item.mrp) > Number(item.sellingPrice) && (
                        <p className="mt-1 text-xs text-slate-400 line-through">
                          {formatCurrency(item.mrp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Customer */}
            <SectionCard title="Customer Information" icon={User}>
              <DetailRow
                label="Customer Name"
                value={customer.name}
              />
              <DetailRow
                label="Email Address"
                value={customer.email}
              />
              <DetailRow
                label="Customer ID"
                value={customer._id}
              />
            </SectionCard>

            {/* Shipping Address */}
            <SectionCard title="Shipping Address" icon={MapPin}>
              {Object.entries(address)
                .filter(
                  ([key, value]) =>
                    !["_id", "__v"].includes(key) &&
                    value !== undefined &&
                    value !== null &&
                    value !== "",
                )
                .map(([key, value]) => (
                  <DetailRow
                    key={key}
                    label={formatLabel(key)}
                    value={
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)
                    }
                  />
                ))}

              {Object.keys(address).length === 0 && (
                <p className="text-sm text-slate-500">
                  Shipping address is not available.
                </p>
              )}
            </SectionCard>

            {/* Shipment Management */}
            <SectionCard title="Shipment Management" icon={Truck}>
              <form onSubmit={handleShipmentUpdate} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="provider" className="mb-2 block text-sm font-medium text-slate-700">
                      Courier Provider
                    </label>
                    <select
                      id="provider"
                      name="provider"
                      value={shipmentForm.provider}
                      onChange={handleShipmentChange}
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="SHIPROCKET">Shiprocket</option>
                      <option value="SELF">Self Shipping</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="courierName" className="mb-2 block text-sm font-medium text-slate-700">
                      Courier Name
                    </label>
                    <input
                      id="courierName"
                      name="courierName"
                      value={shipmentForm.courierName}
                      onChange={handleShipmentChange}
                      placeholder="e.g. Delhivery"
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipmentId" className="mb-2 block text-sm font-medium text-slate-700">
                      Shipment ID
                    </label>
                    <input
                      id="shipmentId"
                      name="shipmentId"
                      value={shipmentForm.shipmentId}
                      onChange={handleShipmentChange}
                      placeholder="Enter shipment ID"
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="awbCode" className="mb-2 block text-sm font-medium text-slate-700">
                      AWB Number
                    </label>
                    <input
                      id="awbCode"
                      name="awbCode"
                      value={shipmentForm.awbCode}
                      onChange={handleShipmentChange}
                      placeholder="Enter AWB number"
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="courierCompanyId" className="mb-2 block text-sm font-medium text-slate-700">
                      Courier Company ID
                    </label>
                    <input
                      id="courierCompanyId"
                      name="courierCompanyId"
                      value={shipmentForm.courierCompanyId}
                      onChange={handleShipmentChange}
                      placeholder="Optional"
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="estimatedDeliveryDate" className="mb-2 block text-sm font-medium text-slate-700">
                      Estimated Delivery Date
                    </label>
                    <input
                      id="estimatedDeliveryDate"
                      type="date"
                      name="estimatedDeliveryDate"
                      value={shipmentForm.estimatedDeliveryDate}
                      onChange={handleShipmentChange}
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="trackingUrl" className="mb-2 block text-sm font-medium text-slate-700">
                    Tracking URL
                  </label>
                  <input
                    id="trackingUrl"
                    type="url"
                    name="trackingUrl"
                    value={shipmentForm.trackingUrl}
                    onChange={handleShipmentChange}
                    placeholder="https://..."
                    disabled={shipmentSaving}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-4 font-semibold text-slate-900">
                    Update Tracking Status
                  </h3>

                  <div>
                    <label htmlFor="trackingStatus" className="mb-2 block text-sm font-medium text-slate-700">
                      Tracking Status
                    </label>
                    <select
                      id="trackingStatus"
                      name="status"
                      value={shipmentForm.status}
                      onChange={handleShipmentChange}
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Shipment details only</option>
                      <option value="NEW">New</option>
                      <option value="PICKUP SCHEDULED">Pickup Scheduled</option>
                      <option value="PICKED UP">Picked Up</option>
                      <option value="IN TRANSIT">In Transit</option>
                      <option value="OUT FOR DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      Select the next valid status in the shipment sequence.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="trackingDescription" className="mb-2 block text-sm font-medium text-slate-700">
                      Status Description
                      {shipmentForm.status && <span className="text-red-500"> *</span>}
                    </label>
                    <textarea
                      id="trackingDescription"
                      name="description"
                      value={shipmentForm.description}
                      onChange={handleShipmentChange}
                      placeholder="Enter tracking update description"
                      rows={3}
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="trackingLocation" className="mb-2 block text-sm font-medium text-slate-700">
                      Current Location
                    </label>
                    <input
                      id="trackingLocation"
                      name="location"
                      value={shipmentForm.location}
                      onChange={handleShipmentChange}
                      placeholder="e.g. Malappuram, Kerala"
                      disabled={shipmentSaving}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={shipmentSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {shipmentSaving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Updating Shipment...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Shipment Details
                    </>
                  )}
                </button>
              </form>
            </SectionCard>

            {/* Tracking History */}
            <SectionCard title="Tracking History" icon={Clock}>
              {trackingHistory.length > 0 ? (
                <div className="space-y-5">
                  {trackingHistory.map((event, index) => (
                    <div
                      key={event._id || `${event.status}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          {event.status === "DELIVERED" ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            <Truck size={17} />
                          )}
                        </div>
                        {index !== trackingHistory.length - 1 && (
                          <div className="mt-1 min-h-8 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatLabel(event.status)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {event.description || "No description"}
                        </p>
                        {event.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={13} />
                            {event.location}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(event.timestamp)}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {event.source || "ADMIN"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No tracking history available yet.
                </p>
              )}
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Status */}
            <SectionCard title="Update Order Status" icon={Truck}>
              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Current Status
                </p>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    orderStatusStyles[order.orderStatus] ||
                    "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              {availableStatuses.length > 0 ? (
                <>
                  <div className="mt-5">
                    <label
                      htmlFor="orderStatus"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Next Status
                    </label>

                    <select
                      id="orderStatus"
                      value={selectedStatus}
                      onChange={(event) =>
                        setSelectedStatus(event.target.value)
                      }
                      disabled={saving}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={saving || !selectedStatus}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        Update Status
                      </>
                    )}
                  </button>
                </>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  This order has reached its final status.
                </p>
              )}
            </SectionCard>

            {/* Payment */}
            <SectionCard title="Payment Information" icon={CreditCard}>
              <DetailRow
                label="Payment Method"
                value={order.paymentMethod}
              />
              <DetailRow
                label="Payment Status"
                value={formatLabel(order.paymentStatus)}
              />
            </SectionCard>

            {/* Price Summary */}
            <SectionCard title="Price Summary" icon={CreditCard}>
              <DetailRow
                label="Subtotal"
                value={formatCurrency(order.subtotal)}
              />
              <DetailRow
                label="Shipping Fee"
                value={formatCurrency(order.shippingFee)}
              />
              <DetailRow
                label="Discount"
                value={`-${formatCurrency(order.discount)}`}
              />

              {order.coupon?.code && (
                <DetailRow
                  label="Coupon"
                  value={order.coupon.code}
                />
              )}

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-900">
                  Grand Total
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </SectionCard>

            {/* Timeline */}
            <SectionCard title="Order Timeline" icon={CalendarDays}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock
                    size={17}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Order Placed
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 text-green-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Delivered
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(order.deliveredAt)}
                      </p>
                    </div>
                  </div>
                )}

                {order.cancelledAt && (
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 text-red-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Cancelled
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(order.cancelledAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
