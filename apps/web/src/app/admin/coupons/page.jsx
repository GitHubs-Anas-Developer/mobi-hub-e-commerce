
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TicketPercent,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";

import useAdminCoupons from "@/hooks/useAdminCoupons";
import adminCouponService from "@/services/adminCouponService";

export default function AdminCouponsPage() {
  const {
    coupons,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingCouponId,
    refreshCoupons,
    updateCouponStatus,
  } = useAdminCoupons();

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [deletingCouponId, setDeletingCouponId] = useState(null);

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Coupon status
  const getCouponStatus = (coupon) => {
    const now = new Date();

    if (!coupon.isActive) return "Inactive";
    if (now < new Date(coupon.startDate)) return "Scheduled";
    if (now > new Date(coupon.expiryDate)) return "Expired";

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return "Limit Reached";
    }

    return "Active";
  };

  const statusStyles = {
    Active: "bg-green-50 text-green-700",
    Inactive: "bg-slate-100 text-slate-600",
    Scheduled: "bg-blue-50 text-blue-700",
    Expired: "bg-red-50 text-red-700",
    "Limit Reached": "bg-amber-50 text-amber-700",
  };

  // Update filters and reset pagination
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // Toggle coupon status
  const handleToggleStatus = async (coupon) => {
    if (updatingCouponId) return;

    const nextStatus = !coupon.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } coupon ${coupon.code}?`,
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setActionSuccess("");

      await updateCouponStatus(coupon._id, nextStatus);

      setActionSuccess(
        nextStatus
          ? "Coupon activated successfully."
          : "Coupon deactivated successfully.",
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to update coupon status.",
      );
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (coupon) => {
    if (deletingCouponId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete coupon ${coupon.code}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingCouponId(coupon._id);
      setActionError("");
      setActionSuccess("");

      await adminCouponService.deleteCoupon(coupon._id);

      setActionSuccess("Coupon deleted successfully.");

      await refreshCoupons();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to delete coupon.",
      );
    } finally {
      setDeletingCouponId(null);
    }
  };

  // Statistics (current loaded page)
  const activeCount = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Active",
  ).length;

  const inactiveCount = coupons.filter(
    (coupon) => !coupon.isActive,
  ).length;

  const expiredCount = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Expired",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Coupons
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage discount coupons, usage limits and validity.
          </p>
        </div>

        <Link
          href="/admin/coupons/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Coupon
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Coupons",
            value: pagination?.total ?? 0,
            color: "text-slate-900",
            icon: TicketPercent,
          },
          {
            label: "Active Coupons",
            value: activeCount,
            color: "text-green-600",
            icon: Power,
          },
          {
            label: "Inactive Coupons",
            value: inactiveCount,
            color: "text-slate-600",
            icon: Power,
          },
          {
            label: "Expired Coupons",
            value: expiredCount,
            color: "text-red-600",
            icon: CalendarDays,
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
              placeholder="Search coupon code or description..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={refreshCoupons}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {/* Active Status */}
          <select
            value={filters.status}
            onChange={(event) =>
              handleFilterChange("status", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Expiry Status */}
          <select
            value={filters.expiryStatus}
            onChange={(event) =>
              handleFilterChange("expiryStatus", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="all">All Validity</option>
            <option value="active">Currently Valid</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(event) =>
              handleFilterChange("sortBy", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="createdAt">Created Date</option>
            <option value="code">Coupon Code</option>
            <option value="discountValue">Discount Value</option>
            <option value="expiryDate">Expiry Date</option>
          </select>

          {/* Sort Order */}
          <select
            value={filters.sortOrder}
            onChange={(event) =>
              handleFilterChange("sortOrder", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          {/* Page Limit */}
          <select
            value={filters.limit}
            onChange={(event) =>
              handleFilterChange("limit", Number(event.target.value))
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Feedback */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Coupons Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "Coupon",
                  "Discount",
                  "Minimum Order",
                  "Usage",
                  "Validity",
                  "Status",
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
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Loader2
                      size={26}
                      className="mx-auto animate-spin text-blue-700"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Loading coupons...
                    </p>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <TicketPercent
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 font-medium text-slate-700">
                      No coupons found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const isUpdating = updatingCouponId === coupon._id;
                  const isDeleting = deletingCouponId === coupon._id;

                  return (
                    <tr
                      key={coupon._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Coupon */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {coupon.code}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {coupon.description || "No description"}
                        </p>
                      </td>

                      {/* Discount */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {coupon.discountType === "Percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </p>

                        {coupon.maxDiscountAmount !== null &&
                          coupon.maxDiscountAmount !== undefined && (
                            <p className="mt-1 text-xs text-slate-500">
                              Max ₹{coupon.maxDiscountAmount}
                            </p>
                          )}
                      </td>

                      {/* Minimum Order */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        ₹{coupon.minOrderAmount}
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {coupon.usedCount}
                          {" / "}
                          {coupon.usageLimit ?? "Unlimited"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Per user: {coupon.perUserLimit}
                        </p>
                      </td>

                      {/* Validity */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <p>{formatDate(coupon.startDate)}</p>

                        <p className="mt-1 text-xs text-slate-500">
                          to {formatDate(coupon.expiryDate)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[status]
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/coupons/${coupon._id}/edit`}
                            title="Edit coupon"
                            className="rounded-lg border border-blue-200 p-2 text-blue-700 transition hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(coupon)}
                            disabled={Boolean(updatingCouponId)}
                            title={
                              coupon.isActive
                                ? "Deactivate coupon"
                                : "Activate coupon"
                            }
                            className={`rounded-lg border p-2 transition disabled:opacity-50 ${
                              coupon.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon)}
                            disabled={Boolean(deletingCouponId)}
                            title="Delete coupon"
                            className="rounded-lg border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer and Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {coupons.length} of {pagination?.total ?? 0} coupons
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm text-slate-500">
              Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 0}
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
