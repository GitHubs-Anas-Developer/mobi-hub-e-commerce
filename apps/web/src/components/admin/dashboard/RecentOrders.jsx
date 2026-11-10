
"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getStatusStyle = (status) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-blue-50 text-blue-700",
    Processing: "bg-indigo-50 text-indigo-700",
    Shipped: "bg-purple-50 text-purple-700",
    Delivered: "bg-green-50 text-green-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  return styles[status] || "bg-slate-100 text-slate-600";
};

export default function RecentOrders({
  orders = [],
  loading = false,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest customer orders.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4 p-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-3 rounded-full bg-slate-100 p-4">
            <ShoppingCart size={24} className="text-slate-400" />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            No recent orders
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Customer orders will appear here.
          </p>
        </div>
      ) : (
        /* Orders Table */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-blue-700">
                    {order.orderNumber || order._id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {order.user?.name || "Customer"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {order.user?.email || ""}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-800">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {order.paymentStatus || "N/A"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                        order.orderStatus,
                      )}`}
                    >
                      {order.orderStatus || "Pending"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {order.createdAt
                      ? formatDate(order.createdAt)
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
