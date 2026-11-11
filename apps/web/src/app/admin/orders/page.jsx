
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";

import useAdminOrders from "@/hooks/useAdminOrders";

export default function AdminOrdersPage() {
  const {
    orders,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    refreshOrders,
  } = useAdminOrders();

  const [actionError, setActionError] = useState("");

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: 1,
    }));
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const orderStatusStyles = {
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-blue-50 text-blue-700",
    Processing: "bg-indigo-50 text-indigo-700",
    Shipped: "bg-purple-50 text-purple-700",
    Delivered: "bg-green-50 text-green-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  const paymentStatusStyles = {
    Pending: "bg-amber-50 text-amber-700",
    Paid: "bg-green-50 text-green-700",
    Failed: "bg-red-50 text-red-700",
    PartiallyRefunded: "bg-orange-50 text-orange-700",
    Refunded: "bg-slate-100 text-slate-700",
  };

  const totalOrders = pagination?.totalOrders ?? 0;

  const pendingCount = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  const processingCount = orders.filter(
    (order) =>
      ["Confirmed", "Processing"].includes(order.orderStatus)
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Orders
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage customer orders, payment status and order fulfillment.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Orders",
            value: totalOrders,
            color: "text-slate-900",
            icon: ShoppingCart,
          },
          {
            label: "Pending Orders",
            value: pendingCount,
            color: "text-amber-600",
            icon: CalendarDays,
          },
          {
            label: "Processing Orders",
            value: processingCount,
            color: "text-blue-600",
            icon: RefreshCw,
          },
          {
            label: "Delivered Orders",
            value: deliveredCount,
            color: "text-green-600",
            icon: ShoppingCart,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <Icon size={20} className={item.color} />
              </div>

              <p className={`mt-3 text-2xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              placeholder="Search order number, customer, email or product..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {filters.search && (
              <button
                type="button"
                onClick={() =>
                  handleFilterChange("search", "")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={refreshOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* Order Status */}
          <select
            value={filters.status}
            onChange={(event) =>
              handleFilterChange("status", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="all">All Order Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Status */}
          <select
            value={filters.paymentStatus}
            onChange={(event) =>
              handleFilterChange("paymentStatus", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="all">All Payment Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Sorting */}
          <select
            value={filters.sort}
            onChange={(event) =>
              handleFilterChange("sort", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
          </select>

          {/* Start Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Start Date
            </label>

            <input
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(event) =>
                handleFilterChange("startDate", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              End Date
            </label>

            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(event) =>
                handleFilterChange("endDate", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            />
          </div>

          {/* Page Limit */}
          <select
            value={filters.limit}
            onChange={(event) =>
              handleFilterChange("limit", Number(event.target.value))
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 sm:self-end"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.status !== "all" ||
          filters.paymentStatus !== "all" ||
          filters.startDate ||
          filters.endDate ||
          filters.search ||
          filters.sort !== "newest") && (
          <button
            type="button"
            onClick={() =>
              setFilters((previous) => ({
                ...previous,
                status: "all",
                paymentStatus: "all",
                search: "",
                startDate: "",
                endDate: "",
                sort: "newest",
                page: 1,
              }))
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            <X size={15} />
            Clear all filters
          </button>
        )}
      </div>

      {/* Feedback */}
      {(error || actionError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError || error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Items",
                  "Total",
                  "Payment",
                  "Order Status",
                  "Date",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <Loader2
                      size={26}
                      className="mx-auto animate-spin text-blue-700"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Loading orders...
                    </p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <ShoppingCart
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 font-medium text-slate-700">
                      No orders found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Order */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.paymentMethod}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {order.user?.name || "Unknown customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.user?.email || "—"}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {order.items?.length || 0} products
                      </p>

                      <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                        {order.items
                          ?.map((item) => item.productName)
                          .join(", ") || "—"}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          paymentStatusStyles[order.paymentStatus] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          orderStatusStyles[order.orderStatus] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        title="View order details"
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer and Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {orders.length} of {totalOrders} orders
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm text-slate-500">
              Page {pagination?.currentPage ?? filters.page} of{" "}
              {pagination?.totalPages ?? 0}
            </span>

            <button
              type="button"
              onClick={() =>
                handleFilterChange("page", filters.page - 1)
              }
              disabled={filters.page <= 1 || loading}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                handleFilterChange("page", filters.page + 1)
              }
              disabled={
                !pagination ||
                filters.page >= pagination.totalPages ||
                loading
              }
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
