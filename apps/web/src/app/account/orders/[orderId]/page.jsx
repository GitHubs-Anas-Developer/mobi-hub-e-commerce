 "use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  UserRound,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Copy,
  ReceiptText,
} from "lucide-react";
import { motion } from "framer-motion";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import orderService from "@/services/orderService";
import OrderDetailsSkeleton from "@/components/loading/skeletons/OrderDetailsSkeleton";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return "";
  if (typeof thumbnail === "object") return thumbnail.url || "";

  if (typeof thumbnail === "string") {
    const value = thumbnail.trim();
    if (value.startsWith("https://") || value.startsWith("http://")) {
      return value;
    }

    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed.url || "" : "";
    } catch {
      return "";
    }
  }

  return "";
};

const getStatusClasses = (status) => {
  const value = String(status || "").toLowerCase();

  if (["paid", "delivered", "confirmed"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (["processing", "shipped", "out for delivery"].includes(value)) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getAttributes = (value) => {
  if (!value) return [];
  if (value instanceof Map) return Array.from(value.entries());
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.entries(value);
  return [];
};

function StatusPill({ children, status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
        status || children
      )}`}
    >
      {children || "Pending"}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-semibold text-slate-800 ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function OrderDetailsContent() {
  const params = useParams();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await orderService.getOrderById(orderId);
        const orderData = response?.data?.data || response?.data || response;

        if (!orderData?._id) throw new Error("Invalid order response.");

        if (isMounted) setOrder(orderData);
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load order details."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!orderId || typeof orderId !== "string") {
      setOrder(null);
      setError("Order ID is missing from the URL.");
      setLoading(false);
    } else {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) return <OrderDetailsSkeleton />;

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertCircle size={30} />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">
          Unable to load order
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {error || "Order not found."}
        </p>
        <Link
          href="/account/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
        >
          <ArrowLeft size={16} />
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCOD = String(order.paymentMethod || "").toUpperCase() === "COD";
  const isPaid = String(order.paymentStatus || "").toLowerCase() === "paid";
  const isCancelled = String(order.orderStatus || "").toLowerCase() === "cancelled";
  const address = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const orderNumber = order.orderNumber || order._id;
  const shipmentId = order.shipment?.shipmentId;

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(String(orderNumber));
    } catch {
      // Clipboard access may be unavailable; the order number remains visible.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full space-y-5 sm:space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/account/orders"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0755E9]"
          >
            <ArrowLeft size={16} />
            My Orders
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Order Details
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View your order, items and delivery information
          </p>
        </div>
        <Link
          href="/products"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0755E9] sm:inline-flex"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </Link>
      </div>

      {/* Order overview */}
      <InfoCard className="overflow-hidden !p-0">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0755E9] sm:h-14 sm:w-14">
              <Package size={25} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Order number
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="break-all text-lg font-extrabold text-slate-900 sm:text-xl">
                  #{orderNumber}
                </h2>
                <button
                  type="button"
                  onClick={copyOrderNumber}
                  aria-label="Copy order number"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#0755E9]"
                >
                  <Copy size={15} />
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-500">Order status</span>
              <StatusPill status={order.orderStatus}>
                {order.orderStatus || "Pending"}
              </StatusPill>
            </div>
            {shipmentId && !isCancelled && (
              <Link
                href={`/account/orders/${order._id}/tracking`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
              >
                <Truck size={16} />
                Track shipment
              </Link>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/70 sm:grid-cols-3">
          <div className="p-4 sm:px-6">
            <p className="text-xs text-slate-500">Items</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}{" "}
              items
            </p>
          </div>
          <div className="border-l border-slate-100 p-4 sm:px-6">
            <p className="text-xs text-slate-500">Payment</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {isCOD ? "Cash on Delivery" : "Online Payment"}
            </p>
          </div>
          <div className="col-span-2 border-t border-slate-100 p-4 sm:col-span-1 sm:border-l sm:border-t-0 sm:px-6">
            <p className="text-xs text-slate-500">Total amount</p>
            <p className="mt-1 text-base font-extrabold text-[#0755E9]">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </InfoCard>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="min-w-0 space-y-5">
          <InfoCard>
            <SectionHeading
              icon={Package}
              title={`Ordered Items (${items.length})`}
              subtitle="Products included in this order"
            />
            {items.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No item details available.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const thumbnailUrl = getThumbnailUrl(item.thumbnail);
                  const attributes = getAttributes(item.attributes);

                  return (
                    <div
                      key={item.variantId || item.productId || index}
                      className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:h-28 sm:w-28">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={item.productName || "Product"}
                            loading="lazy"
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Package size={28} className="text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold leading-6 text-slate-900">
                          {item.productName || "Product"}
                        </h3>
                        {item.sku && (
                          <p className="mt-1 text-xs text-slate-400">
                            SKU: {item.sku}
                          </p>
                        )}
                        {attributes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {attributes.map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Qty: {item.quantity || 0}</span>
                          <span>Unit price: {formatPrice(item.sellingPrice)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <p className="text-xs text-slate-500">Item total</p>
                        <p className="mt-1 font-extrabold text-slate-900">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </InfoCard>

          <InfoCard>
            <SectionHeading
              icon={MapPin}
              title="Delivery Address"
              subtitle="Shipping destination for this order"
            />
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0755E9] shadow-sm">
                  <MapPin size={19} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {address.fullName || "Name not available"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {[
                      address.addressLine1,
                      address.addressLine2,
                      address.landmark,
                      [address.city, address.state, address.pincode]
                        .filter(Boolean)
                        .join(", "),
                      address.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Address not available"}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Phone:{" "}
                    <span className="font-semibold text-slate-800">
                      {address.phone || "N/A"}
                    </span>
                  </p>
                  {address.alternatePhone && (
                    <p className="mt-1 text-sm text-slate-500">
                      Alternate phone:{" "}
                      <span className="font-semibold text-slate-800">
                        {address.alternatePhone}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard>
            <SectionHeading
              icon={CreditCard}
              title="Payment Information"
              subtitle="Payment method and transaction status"
            />
            <div className="space-y-4">
              <InfoRow
                label="Payment method"
                value={isCOD ? "Cash on Delivery" : "Online Payment"}
              />
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">Payment status</span>
                <StatusPill status={order.paymentStatus}>
                  {order.paymentStatus || "Pending"}
                </StatusPill>
              </div>
              {order.paymentDetails?.transactionId && (
                <InfoRow
                  label="Transaction ID"
                  value={order.paymentDetails.transactionId}
                />
              )}
              {order.paidAt && (
                <InfoRow label="Paid on" value={formatDate(order.paidAt)} />
              )}
              {isCOD && !isPaid && !isCancelled && (
                <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-700">
                  <Truck size={16} className="mt-0.5 shrink-0" />
                  Payment is due when your order is delivered.
                </div>
              )}
              {!isCOD && !isPaid && !isCancelled && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                  <Clock3 size={16} className="mt-0.5 shrink-0" />
                  Your online payment is not confirmed yet.
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        {/* Summary column */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <InfoCard>
            <SectionHeading
              icon={ReceiptText}
              title="Price Summary"
              subtitle="A breakdown of your order total"
            />
            <div className="space-y-4">
              <InfoRow
                label="Subtotal"
                value={formatPrice(order.subtotal)}
              />
              {Number(order.discount) > 0 && (
                <InfoRow
                  label={`Discount${order.coupon?.code ? ` (${order.coupon.code})` : ""}`}
                  value={`-${formatPrice(order.discount)}`}
                  valueClass="text-emerald-600"
                />
              )}
              <InfoRow
                label="Shipping fee"
                value={
                  Number(order.shippingFee) === 0
                    ? "Free"
                    : formatPrice(order.shippingFee)
                }
                valueClass={Number(order.shippingFee) === 0 ? "text-emerald-600" : ""}
              />
              <div className="border-t border-dashed border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-900">Total amount</span>
                  <span className="text-xl font-extrabold text-[#0755E9]">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <p className="mt-1 text-right text-[11px] text-slate-400">
                  Inclusive of applicable charges
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3">
              {isPaid ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <ShieldCheck size={18} className="text-slate-500" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {isPaid ? "Payment completed" : isCOD ? "Pay on delivery" : "Payment pending"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {isPaid ? "Your payment has been received." : "See payment information for details."}
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard>
            <SectionHeading
              icon={ShieldCheck}
              title="Need Help?"
              subtitle="We are here to help with your order"
            />
            <p className="text-sm leading-6 text-slate-500">
              If you have a question about this order, contact the ELEZIO support team.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#0755E9] transition hover:bg-blue-100"
            >
              Contact Support
              <ArrowRight size={16} />
            </Link>
          </InfoCard>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#0755E9]"
            >
              <UserRound size={15} />
              My Account
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#0755E9]"
            >
              <ShoppingBag size={15} />
              Shop More
            </Link>
          </div>
        </aside>
      </div>

      {isCancelled && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">This order has been cancelled</p>
            <p className="mt-1 text-xs leading-5">
              If you need help regarding this cancellation, please contact support.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function OrderDetailsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <OrderDetailsContent />
      </main>
    </ProtectedRoute>
  );
}
