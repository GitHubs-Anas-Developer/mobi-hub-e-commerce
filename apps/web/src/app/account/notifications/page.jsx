"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  RotateCcw,
  Info,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountShell from "@/components/account/AccountShell";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/store/thunks/notificationThunks";

const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getNotificationIcon = (type = "") => {
  const value = type.toLowerCase();
  if (value.includes("order")) return Package;
  if (value.includes("payment")) return CreditCard;
  if (value.includes("return") || value.includes("refund")) return RotateCcw;
  return Info;
};

function NotificationsPageContent() {
  const dispatch = useDispatch();

  const { notifications, pagination, isLoading, isMutating, error } =
    useSelector((state) => state.notifications);

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState("");
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const loadNotifications = (nextPage = page, nextFilter = filter) => {
    const params = {
      page: nextPage,
      limit: 10,
    };

    if (nextFilter !== "all") {
      params.isRead = nextFilter === "read";
    }

    dispatch(fetchNotifications(params));
  };

  useEffect(() => {
    loadNotifications(1, "all");
  }, []);

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
    setMessage("");
    setLocalError("");
    loadNotifications(1, value);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  const handleMarkAsRead = async (notificationId) => {
    setActiveId(notificationId);
    setMessage("");
    setLocalError("");

    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      setMessage("Marked as read.");
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to update notification."
      );
    } finally {
      setActiveId("");
    }
  };

  const handleMarkAllAsRead = async () => {
    setMessage("");
    setLocalError("");

    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success("All notifications marked as read.");
      loadNotifications(page);
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to update notifications."
      );
    }
  };

  const handleDelete = async (notificationId) => {
    setActiveId(notificationId);
    setMessage("");
    setLocalError("");

    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success("Notification removed.");

      if (notifications.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        loadNotifications(page);
      }
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to delete notification."
      );
    } finally {
      setActiveId("");
    }
  };

  const handleDeleteAll = async () => {
    setConfirmClearAll(false);
    setMessage("");
    setLocalError("");

    try {
      await dispatch(deleteAllNotifications()).unwrap();
      setPage(1);
      toast.success("All notifications cleared.");
      loadNotifications(1);
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to delete notifications."
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = pagination?.totalPages || 1;

  const filters = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Read", value: "read" },
  ];

  return (
    <AccountShell
      activeSection="notifications"
      breadcrumbLabel="Notifications & Settings"
      title="Notifications & Updates"
      description="Stay informed on order confirmations, dispatch alerts, payments, and account activity."
      headerRight={
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-bold text-[#101828] tabular-nums">
          <Bell size={14} className="text-[#0755E9]" aria-hidden="true" />
          {unreadCount} Unread
        </span>
      }
    >
      <div className="space-y-5">
        {(message || localError || error) && (
          <div
            role={localError || error ? "alert" : "status"}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold sm:text-sm ${
              localError || error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {localError || error ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0" />
            )}
            <span>{localError || error || message}</span>
          </div>
        )}

        {/* Filter & Bulk Controls */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleFilterChange(item.value)}
                className={`h-9 rounded-xl border px-3.5 text-xs font-bold transition ${
                  filter === item.value
                    ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMutating || unreadCount === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#0755E9] transition hover:bg-[#EFF6FF] disabled:opacity-45"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>

            {confirmClearAll ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={isMutating}
                  className="h-9 rounded-xl bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="h-9 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                disabled={isMutating || notifications.length === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-45"
              >
                <Trash2 size={14} />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification Feed */}
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white">
            <LoaderCircle size={28} className="animate-spin text-[#0755E9]" />
            <p className="mt-3 text-xs font-semibold text-[#64748B] sm:text-sm">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
              <Bell size={26} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#101828]">
              No notifications found
            </h2>
            <p className="mt-1.5 max-w-sm text-xs text-[#64748B] sm:text-sm">
              You&apos;re all caught up. Updates about orders and deliveries will appear here.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0]">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const isActive = activeId === notification._id;

              return (
                <div
                  key={notification._id}
                  className={`flex gap-3.5 p-4 transition-colors sm:p-5 ${
                    !notification.isRead ? "bg-[#EFF6FF]/45" : "bg-white hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      notification.isRead
                        ? "bg-slate-100 text-[#64748B]"
                        : "bg-[#0755E9] text-white"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#101828]">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#0755E9]">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#64748B] sm:text-sm">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] font-medium text-[#64748B]">
                      {formatDate(notification.createdAt)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {!notification.isRead && (
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs font-bold text-[#0755E9] hover:underline disabled:opacity-45"
                        >
                          {isActive ? "Updating..." : "Mark as read"}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => handleDelete(notification._id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline disabled:opacity-45"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <Circle
                      size={8}
                      fill="currentColor"
                      className="mt-2 shrink-0 text-[#0755E9]"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && notifications.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
            <p className="text-xs font-medium text-[#64748B] tabular-nums">
              Page{" "}
              <span className="font-bold text-[#101828]">{pagination.page}</span>{" "}
              of <span className="font-bold text-[#101828]">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-45"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isLoading}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-45"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AccountShell>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}
