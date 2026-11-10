"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import orderService from "@/services/orderService";

const ORDERS_PER_PAGE = 5;

const ORDER_FILTERS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["paid", "delivered", "completed"].includes(value)) {
    return "bg-green-100 text-green-700";
  }

  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "bg-red-100 text-red-700";
  }

  if (["shipped", "processing"].includes(value)) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
};

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await orderService.getOrders();

        const orderList =
          response?.data?.orders ||
          response?.data?.data ||
          response?.data ||
          response?.orders ||
          response?.data?.items ||
          [];

        setOrders(Array.isArray(orderList) ? orderList : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filterCounts = useMemo(() => {
    const counts = {
      All: orders.length,
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const status = String(order.orderStatus || "Pending").toLowerCase();

      const matchingFilter = ORDER_FILTERS.find(
        (filter) => filter !== "All" && filter.toLowerCase() === status,
      );

      if (matchingFilter) {
        counts[matchingFilter] += 1;
      }
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") return orders;

    return orders.filter(
      (order) =>
        String(order.orderStatus || "Pending").toLowerCase() ===
        activeFilter.toLowerCase(),
    );
  }, [orders, activeFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;

    return filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            ← Back to My Account
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track and manage your MOBI HUB orders.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={handleRetry}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You haven&apos;t placed any orders yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Order Filters */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Filter Orders
                </h2>

                <span className="text-xs text-slate-500">
                  {orders.length} total
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {ORDER_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => handleFilterChange(filter)}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {filter}
                    <span className="ml-2 text-xs">{filterCounts[filter]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
                <div className="text-3xl">📦</div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  No {activeFilter.toLowerCase()} orders
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  You don&apos;t have any orders with this status.
                </p>

                <button
                  type="button"
                  onClick={() => handleFilterChange("All")}
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View All Orders
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {paginatedOrders.length} of {filteredOrders.length}{" "}
                    orders
                  </p>
                </div>

                <div className="space-y-5">
                  {paginatedOrders.map((order) => {
                    const orderId = order._id || order.id;

                    const orderNumber =
                      order.orderNumber || order.orderId || orderId;

                    const totalAmount =
                      order.totalAmount ?? order.total ?? order.grandTotal ?? 0;

                    return (
                      <div
                        key={orderId}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Order Number
                            </p>

                            <h2 className="mt-1 break-all text-sm font-bold text-slate-900">
                              {orderNumber}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                order.orderStatus,
                              )}`}
                            >
                              {order.orderStatus || "Pending"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                order.paymentStatus,
                              )}`}
                            >
                              Payment: {order.paymentStatus || "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="my-5 border-t border-slate-100" />

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-slate-400">
                              Total Amount
                            </p>

                            <p className="mt-1 font-bold text-slate-900">
                              {formatPrice(totalAmount)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Payment Method
                            </p>

                            <p className="mt-1 font-semibold text-slate-700">
                              {order.paymentMethod === "Online"
                                ? "Online Payment"
                                : order.paymentMethod || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Items</p>

                            <p className="mt-1 font-semibold text-slate-700">
                              {order.items?.length || 0} items
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                          <Link
                            href={`/order-success/${orderId}`}
                            className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                          >
                            View Order Details →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">
                      Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => page - 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((page) => page + 1)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
