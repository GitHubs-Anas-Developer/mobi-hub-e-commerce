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
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

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

// Animation variants
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const listContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const notificationItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -25,
    transition: {
      duration: 0.2,
    },
  },
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

  // Scroll progress
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

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

  const filters = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Read", value: "read" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Blue Scroll Progress */}
      <motion.div
        className="fixed left-0 top-0 z-[100] h-1 w-full origin-left bg-gradient-to-r from-[#0755E9] via-[#2583FF] to-cyan-400"
        style={{ scaleX: smoothProgress }}
      />

      <div className="mx-auto m-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/account"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              My Account
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  My Account
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Stay updated about your orders, payments and account.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              className="flex w-fit items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
                <Bell size={21} />
              </div>

              <div>
                <p className="text-xs font-medium text-blue-600">
                  Unread notifications
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  {unreadCount}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Success / Error Message */}
        <AnimatePresence mode="wait">
          {(message || localError || error) && (
            <motion.div
              key={localError || error ? "error" : "success"}
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className={`mb-5 flex items-center gap-2 overflow-hidden rounded-xl border px-4 py-3 text-sm font-medium ${
                localError || error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {localError || error ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}

              {localError || error || message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter and Actions */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <motion.button
                  key={item.value}
                  type="button"
                  onClick={() => handleFilterChange(item.value)}
                  whileTap={{ scale: 0.96 }}
                  className={`relative rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === item.value
                      ? "text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter === item.value && (
                    <motion.span
                      layoutId="activeNotificationFilter"
                      className="absolute inset-0 rounded-xl bg-[#0755E9]"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMutating || unreadCount === 0}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0755E9] transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={17} />
                Mark all read
              </motion.button>

              <motion.button
                type="button"
                onClick={handleDeleteAll}
                disabled={isMutating || notifications.length === 0}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={17} />
                Delete all
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Notifications Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[40vh] flex-col items-center justify-center"
            >
              <Loader2 size={34} className="animate-spin text-[#0755E9]" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading notifications...
              </p>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 text-center shadow-sm"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50"
              >
                <Bell size={36} className="text-[#0755E9]" />
              </motion.div>

              <h2 className="mt-5 text-lg font-extrabold text-[#0F172A]">
                No notifications found
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                You&apos;re all caught up. New updates will appear here.
              </p>

              <Link
                href="/products"
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Explore Products
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={`${filter}-${page}`}
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
            >
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const isActive = activeId === notification._id;

                return (
                  <motion.div
                    key={notification._id}
                    layout
                    variants={notificationItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{
                      backgroundColor: notification.isRead
                        ? "#F8FAFC"
                        : "#EFF6FF",
                    }}
                    className={`group flex gap-3 border-b border-[#E2E8F0] p-4 last:border-b-0 sm:gap-4 sm:p-5 ${
                      !notification.isRead ? "bg-blue-50/40" : "bg-white"
                    }`}
                  >
                    {/* Notification Icon */}
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: -5 }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        notification.isRead
                          ? "bg-slate-100 text-slate-500"
                          : "bg-blue-100 text-[#0755E9]"
                      }`}
                    >
                      <Icon size={21} />
                    </motion.div>

                    {/* Notification Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0F172A]">
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-blue-700">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        {!notification.isRead && (
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs font-bold text-[#0755E9] transition hover:text-blue-800 hover:underline disabled:opacity-40"
                          >
                            {isActive ? "Updating..." : "Mark as read"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => handleDelete(notification._id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-500 transition hover:text-red-700 hover:underline disabled:opacity-40"
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

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <Circle
                        size={9}
                        fill="currentColor"
                        className="mt-2 shrink-0 text-[#0755E9]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <AnimatePresence>
          {!isLoading && notifications.length > 0 && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                Page{" "}
                <span className="font-bold text-slate-900">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">{totalPages}</span>
                {" · "}
                {pagination.total} notifications
              </p>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                  aria-label="Previous page"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={19} />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={19} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
