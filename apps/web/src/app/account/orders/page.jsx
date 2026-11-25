
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import orderService from "@/services/orderService";

import {
  Package,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CalendarDays,
  CreditCard,
  Boxes,
  ChevronRight,
  RefreshCw,
  Search,
  ClipboardList,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import OrdersSkeleton from "@/components/loading/skeletons/OrdersSkeleton";

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
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15";
  }

  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "bg-red-50 text-red-700 ring-1 ring-red-600/15";
  }

  if (["shipped", "processing"].includes(value)) {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/15";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15";
};

const getStatusIcon = (status) => {
  const value = String(status || "").toLowerCase();

  if (["delivered", "completed", "paid"].includes(value)) {
    return CheckCircle2;
  }

  if (["cancelled", "failed", "refunded"].includes(value)) {
    return XCircle;
  }

  if (["shipped", "processing"].includes(value)) {
    return Truck;
  }

  return Clock3;
};

const revealTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
};

const revealFromBottom = {
  hidden: {
    opacity: 0,
    y: 55,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: revealTransition,
  },
};

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Smooth scroll progress
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Fetch Orders
  const loadOrders = useCallback(async () => {
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
      setError(
        err.response?.data?.message || "Failed to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter Counts
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
        (filter) =>
          filter !== "All" && filter.toLowerCase() === status
      );

      if (matchingFilter) {
        counts[matchingFilter] += 1;
      }
    });

    return counts;
  }, [orders]);

  // Filter Orders
  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") return orders;

    return orders.filter(
      (order) =>
        String(order.orderStatus || "Pending").toLowerCase() ===
        activeFilter.toLowerCase()
    );
  }, [orders, activeFilter]);

  // Pagination
  const totalPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE
  );

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;

    return filteredOrders.slice(
      startIndex,
      startIndex + ORDERS_PER_PAGE
    );
  }, [filteredOrders, currentPage]);

  // Filter Change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Pagination with smooth scroll to top
  const handlePagination = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const summaryCards = [
    {
      label: "Total Orders",
      count: orders.length,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Processing",
      count: filterCounts.Processing,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Shipped",
      count: filterCounts.Shipped,
      icon: Truck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Delivered",
      count: filterCounts.Delivered,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">

      {/* Blue Scroll Progress */}
      <motion.div
        className="fixed left-0 top-0 z-[100] h-1 w-full origin-left bg-gradient-to-r from-[#0755E9] via-[#2583FF] to-cyan-400"
        style={{ scaleX: smoothProgress }}
      />

      <div className="mx-auto w-full">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-8"
        >
          <Link
            href="/account"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#0755E9]"
          >
            <ArrowLeft size={16} />
            Back to My Account
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-[#0755E9]" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0755E9]">
                  Mobi Hub
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View your purchases and track your order progress.
              </p>
            </div>

            {!loading && !error && orders.length > 0 && (
              <motion.div
                whileHover={{ y: -3 }}
                className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:self-auto"
              >
                <Package size={18} className="text-[#0755E9]" />
                <span className="text-sm font-semibold text-slate-700">
                  {orders.length} Total Orders
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
      {/* Loading State */}
{loading ? (
  <OrdersSkeleton />
) : error ? (

          /* Error State */
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <RefreshCw size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#101828]">
              Unable to load orders
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <motion.button
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={loadOrders}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0645C4]"
            >
              <RefreshCw size={16} />
              Try Again
            </motion.button>
          </motion.div>

        ) : orders.length === 0 ? (

          /* Empty Orders State */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50"
            >
              <ShoppingBag
                size={34}
                strokeWidth={1.5}
                className="text-[#0755E9]"
              />
            </motion.div>

            <h2 className="mt-6 text-xl font-bold text-[#101828]">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              You haven&apos;t placed any orders yet. Explore our products
              and find something you love.
            </p>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-7 inline-flex"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0645C4]"
              >
                <ShoppingBag size={17} />
                Start Shopping
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

        ) : (
          <>
            {/* Order Summary Cards */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.12 },
                },
              }}
              className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {summaryCards.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    variants={revealFromBottom}
                    whileHover={{
                      y: -6,
                      boxShadow: "0px 12px 30px rgba(7,85,233,0.09)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500 sm:text-sm">
                        {item.label}
                      </span>

                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg}`}>
                        <Icon size={18} className={item.color} />
                      </div>
                    </div>

                    <motion.p
                      key={item.count}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-2xl font-bold text-[#101828]"
                    >
                      {item.count}
                    </motion.p>
                  </motion.div>
                );
              })}
            </motion.section>

            {/* Order History */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={revealFromBottom}
              className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-bold text-[#101828]">
                    Order History
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Filter your orders by their current status.
                  </p>
                </div>

                <span className="text-xs font-medium text-slate-400">
                  {filteredOrders.length} results
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {ORDER_FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;

                  return (
                    <motion.button
                      key={filter}
                      type="button"
                      onClick={() => handleFilterChange(filter)}
                      whileTap={{ scale: 0.94 }}
                      className={`relative shrink-0 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? "text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0755E9]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeOrderFilter"
                          className="absolute inset-0 rounded-xl bg-[#0755E9]"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}

                      <span className="relative z-10">
                        {filter}

                        <span
                          className={`ml-2 rounded-md px-1.5 py-0.5 text-[11px] ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          {filterCounts[filter]}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            {/* Orders List */}
            <AnimatePresence mode="wait">
              {filteredOrders.length === 0 ? (
                <motion.div
                  key={`empty-${activeFilter}`}
                  variants={revealFromBottom}
                  initial="hidden"
                  animate="visible"
                  exit={{
                    opacity: 0,
                    y: -15,
                    transition: { duration: 0.2 },
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <Search size={26} />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-[#101828]">
                    No {activeFilter.toLowerCase()} orders
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    You don&apos;t have any orders with this status.
                  </p>

                  <motion.button
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFilterChange("All")}
                    className="mt-5 rounded-xl bg-[#0755E9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0645C4]"
                  >
                    View All Orders
                  </motion.button>
                </motion.div>

              ) : (
                <motion.div
                  key={`${activeFilter}-${currentPage}`}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.12 },
                    },
                    exit: {
                      transition: {
                        staggerChildren: 0.04,
                        staggerDirection: -1,
                      },
                    },
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Showing{" "}
                      <span className="font-semibold text-[#101828]">
                        {paginatedOrders.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-[#101828]">
                        {filteredOrders.length}
                      </span>{" "}
                      orders
                    </p>
                  </div>

                  <div className="space-y-4">
                    {paginatedOrders.map((order) => {
                      const orderId = order._id || order.id;

                      const orderNumber =
                        order.orderNumber || order.orderId || orderId;

                      const totalAmount =
                        order.totalAmount ??
                        order.total ??
                        order.grandTotal ??
                        0;

                      const OrderStatusIcon = getStatusIcon(
                        order.orderStatus
                      );

                      return (
                        <motion.article
                          key={orderId}
                          variants={{
                            hidden: {
                              opacity: 0,
                              y: 45,
                              scale: 0.98,
                            },
                            visible: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                duration: 0.55,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            },
                            exit: {
                              opacity: 0,
                              y: -15,
                              transition: { duration: 0.2 },
                            },
                          }}
                          whileHover={{
                            y: -5,
                            boxShadow: "0px 15px 35px rgba(7,85,233,0.09)",
                            borderColor: "#BFDBFE",
                          }}
                          className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
                            <div className="flex items-start gap-3">
                              <motion.div
                                whileHover={{ rotate: -8, scale: 1.1 }}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9] transition-colors group-hover:bg-[#0755E9] group-hover:text-white"
                              >
                                <Package size={22} />
                              </motion.div>

                              <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Order Number
                                </p>

                                <h3 className="mt-1 break-all text-sm font-bold text-[#101828]">
                                  {orderNumber}
                                </h3>

                                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                  <CalendarDays size={13} />
                                  Placed on {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.orderStatus)}`}
                              >
                                <OrderStatusIcon size={13} />
                                {order.orderStatus || "Pending"}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.paymentStatus)}`}
                              >
                                Payment: {order.paymentStatus || "Pending"}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100" />

                          {/* Order Details */}
                          <div className="grid grid-cols-2 gap-5 px-5 py-5 sm:grid-cols-3 sm:px-6">
                            <div>
                              <p className="text-xs text-slate-400">
                                Total Amount
                              </p>

                              <p className="mt-1.5 text-base font-bold text-[#101828]">
                                {formatPrice(totalAmount)}
                              </p>
                            </div>

                            <div>
                              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                <CreditCard size={13} />
                                Payment Method
                              </p>

                              <p className="mt-1.5 text-sm font-semibold text-slate-700">
                                {order.paymentMethod === "Online"
                                  ? "Online Payment"
                                  : order.paymentMethod || "N/A"}
                              </p>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Boxes size={13} />
                                Items
                              </p>

                              <p className="mt-1.5 text-sm font-semibold text-slate-700">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                          </div>

                          {/* Order Footer */}
                          <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                            <Link
                              href={`/order-success/${orderId}`}
                              className="group/link inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0645C4]"
                            >
                              View Order Details

                              <motion.span
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight size={16} />
                              </motion.span>
                            </Link>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 35 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={revealTransition}
                      className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <p className="text-sm text-slate-500">
                        Page{" "}
                        <span className="font-semibold text-[#101828]">
                          {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-[#101828]">
                          {totalPages}
                        </span>
                      </p>

                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          disabled={currentPage === 1}
                          whileHover={currentPage !== 1 ? { y: -2 } : {}}
                          whileTap={currentPage !== 1 ? { scale: 0.96 } : {}}
                          onClick={() =>
                            handlePagination(currentPage - 1)
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                        >
                          <ArrowLeft size={15} />
                          Previous
                        </motion.button>

                        <motion.button
                          type="button"
                          disabled={currentPage === totalPages}
                          whileHover={
                            currentPage !== totalPages ? { y: -2 } : {}
                          }
                          whileTap={
                            currentPage !== totalPages ? { scale: 0.96 } : {}
                          }
                          onClick={() =>
                            handlePagination(currentPage + 1)
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                        >
                          Next
                          <ArrowRight size={15} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
