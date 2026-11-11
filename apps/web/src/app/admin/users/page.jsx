
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Power,
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import useAdminUsers from "@/hooks/useAdminUsers";

export default function AdminUsersPage() {
  const {
    users,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingUserId,
    refreshUsers,
    updateUserStatus,
  } = useAdminUsers();

  const [search, setSearch] = useState(filters.search);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Automatic search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      const searchValue = search.trim();

      if (searchValue !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchValue,
          page: 1,
        }));
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, filters.search, setFilters]);

  // Clear search
  const handleClearSearch = () => {
    setSearch("");

    setFilters((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  };

  // Handle filters and pagination
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  // Activate / Deactivate customer
  const handleToggleStatus = async (user) => {
    if (updatingUserId) return;

    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${user.name}?`,
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setActionSuccess("");

      await updateUserStatus(user._id, nextStatus);

      setActionSuccess(
        nextStatus
          ? "Customer activated successfully."
          : "Customer deactivated successfully.",
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to update customer status.",
      );
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Never";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeOnPage = users.filter((user) => user.isActive).length;
  const inactiveOnPage = users.filter((user) => !user.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage customer accounts, email verification and account status.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Customers
            </p>
            <Users size={20} className="text-blue-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination?.total ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Customers matching current filters
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Active Customers
            </p>
            <UserCheck size={20} className="text-green-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-green-600">
            {activeOnPage}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            On current page
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Inactive Customers
            </p>
            <UserX size={20} className="text-red-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-red-600">
            {inactiveOnPage}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            On current page
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or phone..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={refreshUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={filters.status}
            onChange={(event) =>
              handleFilterChange("status", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filters.verification}
            onChange={(event) =>
              handleFilterChange("verification", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <select
            value={filters.sort}
            onChange={(event) =>
              handleFilterChange("sort", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="nameAZ">Name A-Z</option>
            <option value="nameZA">Name Z-A</option>
            <option value="lastLoginNewest">Latest Login</option>
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

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "Customer",
                  "Phone",
                  "Verification",
                  "Status",
                  "Joined",
                  "Last Login",
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
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Users
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 font-medium text-slate-700">
                      No customers found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isUpdating = updatingUserId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={13} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="flex items-center gap-2">
                          <Phone
                            size={14}
                            className="text-slate-400"
                          />
                          {user.phone || "—"}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="px-5 py-4">
                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <ShieldCheck size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <ShieldAlert size={14} />
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Last Login */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.lastLoginAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={Boolean(updatingUserId)}
                          title={
                            user.isActive
                              ? "Deactivate customer"
                              : "Activate customer"
                          }
                          className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isActive
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
            Showing {users.length} of {pagination?.total ?? 0} customers
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
              disabled={!pagination?.hasPrevPage || loading}
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
              disabled={!pagination?.hasNextPage || loading}
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
