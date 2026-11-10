"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  RotateCcw,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
  if (value.includes("return") || value.includes("refund")) {
    return RotateCcw;
  }

  return Info;
};

function NotificationsPageContent() {
  const dispatch = useDispatch();

  const { notifications, pagination, isLoading, isMutating, error } =
    useSelector((state) => state.notifications);

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState("");
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
      setMessage("Notification marked as read.");
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to update notification.",
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
      setMessage("All notifications marked as read.");
      loadNotifications(page);
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to update notifications.",
      );
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Delete this notification?")) return;

    setActiveId(notificationId);
    setMessage("");
    setLocalError("");

    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      setMessage("Notification deleted successfully.");

      if (notifications.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        loadNotifications(page);
      }
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to delete notification.",
      );
    } finally {
      setActiveId("");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) {
      return;
    }

    setMessage("");
    setLocalError("");

    try {
      await dispatch(deleteAllNotifications()).unwrap();
      setPage(1);
      setMessage("All notifications deleted.");
      loadNotifications(1);
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to delete notifications.",
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Stay updated about your orders, payments and account.
            </p>
          </div>

          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] hover:underline"
          >
            <ArrowLeft size={17} />
            My Account
          </Link>
        </div>

        {(message || localError || error) && (
          <div
            className={`mb-5 rounded-lg px-4 py-3 text-sm font-medium ${
              localError || error
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {localError || error || message}
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
              { label: "Read", value: "read" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleFilterChange(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-[#1D4ED8] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMutating || unreadCount === 0}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] disabled:opacity-40"
            >
              <CheckCheck size={17} />
              Mark all read
            </button>

            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={isMutating || notifications.length === 0}
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 disabled:opacity-40"
            >
              <Trash2 size={17} />
              Delete all
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#1D4ED8]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <Bell size={36} className="text-[#1D4ED8]" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#0F172A]">
              No notifications found
            </h2>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              You&apos;re all caught up. New updates will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const isActive = activeId === notification._id;

                return (
                  <div
                    key={notification._id}
                    className={`flex gap-3 border-b border-[#E2E8F0] p-4 last:border-b-0 sm:gap-4 sm:p-5 ${
                      !notification.isRead ? "bg-blue-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8]">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0F172A]">
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        {!notification.isRead && (
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs font-bold text-[#1D4ED8] hover:underline disabled:opacity-40"
                          >
                            {isActive ? "Updating..." : "Mark as read"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => handleDelete(notification._id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline disabled:opacity-40"
                        >
                          {isActive ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>

                    {!notification.isRead && (
                      <Circle
                        size={9}
                        fill="currentColor"
                        className="mt-2 shrink-0 text-[#1D4ED8]"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {totalPages}
                  {" · "}
                  {pagination.total} notifications
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || isLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || isLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}
