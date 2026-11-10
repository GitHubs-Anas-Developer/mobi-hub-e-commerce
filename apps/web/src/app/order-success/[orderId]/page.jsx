
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import orderService from "@/services/orderService";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["paid", "delivered"].includes(value)) {
    return "bg-green-100 text-green-700";
  }

  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "bg-red-100 text-red-700";
  }

  if (["processing", "shipped", "confirmed"].includes(value)) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
};

function OrderSuccessContent() {
  const params = useParams();
  const orderId = params.orderId;

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

        if (!orderData?._id) {
          throw new Error("Invalid order response.");
        }

        if (isMounted) {
          setOrder(orderData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load order details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Unable to load order
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error || "Order not found."}
        </p>

        <Link
          href="/account/orders"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCOD = order.paymentMethod === "COD";
  const isPaid = order.paymentStatus === "Paid";
  const isCancelled = order.orderStatus === "Cancelled";

  const address = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const attributes = (value) => {
    if (!value) return [];

    if (value instanceof Map) {
      return Array.from(value.entries());
    }

    return Object.entries(value);
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              isCancelled
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {isCancelled ? "!" : "✓"}
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
            {isCancelled
              ? "Order Cancelled"
              : "Order Placed Successfully!"}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {isCancelled
              ? "This order has been cancelled."
              : "Thank you for shopping with MOBI HUB. Your order details are shown below."}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Order Number</p>
            <p className="mt-1 break-all text-sm font-bold text-slate-900">
              {order.orderNumber || order._id}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Order Date</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Order Status</p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                order.orderStatus,
              )}`}
            >
              {order.orderStatus || "Pending"}
            </span>
          </div>

          <div>
            <p className="text-xs text-slate-500">Payment Status</p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                order.paymentStatus,
              )}`}
            >
              {order.paymentStatus || "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">
          Order Items ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">
            No item details available.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {items.map((item, index) => (
              <div
                key={item.variantId || index}
                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.productName || "Product"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">
                      📦
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {item.productName || "Product"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    SKU: {item.sku || "N/A"}
                  </p>

                  {attributes(item.attributes).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attributes(item.attributes).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>Qty: {item.quantity}</span>
                    <span>Price: {formatPrice(item.sellingPrice)}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500">Subtotal</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shipping Address */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">
          Delivery Address
        </h2>

        <div className="mt-5 rounded-lg bg-slate-50 p-5">
          <p className="font-semibold text-slate-900">
            {address.fullName || "N/A"}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
            {address.landmark && `, ${address.landmark}`}
            <br />
            {address.city}, {address.state} - {address.pincode}
            <br />
            {address.country}
          </p>

          <p className="mt-3 text-sm text-slate-600">
            Phone: {address.phone || "N/A"}
          </p>

          {address.alternatePhone && (
            <p className="mt-1 text-sm text-slate-600">
              Alternate Phone: {address.alternatePhone}
            </p>
          )}
        </div>
      </section>

      {/* Payment and Price Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">
          Payment & Price Details
        </h2>

        <div className="mt-5 space-y-4">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-semibold text-slate-900">
              {isCOD ? "Cash on Delivery" : "Online Payment"}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Payment Status</span>
            <span
              className={`font-semibold ${
                isPaid ? "text-green-600" : "text-amber-600"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Shipping Fee</span>
              <span className="font-medium text-slate-900">
                {Number(order.shippingFee) === 0
                  ? "Free"
                  : formatPrice(order.shippingFee)}
              </span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Discount
                  {order.coupon?.code && ` (${order.coupon.code})`}
                </span>
                <span className="font-medium text-green-600">
                  -{formatPrice(order.discount)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
            <span className="font-bold text-slate-900">
              Total Amount
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {isCOD && !isPaid && !isCancelled && (
          <p className="mt-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            You can pay when your order is delivered.
          </p>
        )}

        {!isCOD && !isPaid && !isCancelled && (
          <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            Your online payment is not confirmed yet. Please check your
            payment status before trying again.
          </p>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/account/orders"
          className="rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          My Orders
        </Link>

        <Link
          href="/account"
          className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          My Account
        </Link>

        <Link
          href="/products"
          className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <OrderSuccessContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}
