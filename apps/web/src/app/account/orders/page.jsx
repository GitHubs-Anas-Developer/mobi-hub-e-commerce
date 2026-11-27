"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Package,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Search,
  ClipboardList,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountShell from "@/components/account/AccountShell";
import OrdersSkeleton from "@/components/loading/skeletons/OrdersSkeleton";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import {
  canCancelOrder,
  formatCurrencyINR,
  getRefundStatusMeta,
} from "@/components/orders/orderTimelineUtils";
import {
  clearCancelError,
  selectCancellingOrderId,
  selectOrderCancelError,
  selectOrdersListError,
  selectOrdersListLoading,
  selectUserOrders,
} from "@/store/slices/orderSlice";
import { cancelUserOrder, fetchUserOrders } from "@/store/thunks/orderThunks";

const ORDERS_PER_PAGE = 5;

const ORDER_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getOrderItemName = (item) =>
  item?.product?.name ||
  item?.product?.title ||
  item?.productName ||
  item?.name ||
  item?.title ||
  "Product";

const getOrderItemImage = (item) => {
  const thumbnail = item?.thumbnail;
  if (typeof thumbnail === "string") return thumbnail;
  if (thumbnail && typeof thumbnail === "object" && thumbnail.url) {
    return thumbnail.url;
  }

  const productImage =
    item?.product?.images?.[0]?.url ||
    item?.product?.images?.[0] ||
    item?.product?.image ||
    item?.productImage ||
    item?.image ||
    "";

  return typeof productImage === "string"
    ? productImage
    : productImage?.url || "";
};

const getOrderItemQuantity = (item) =>
  Number(item?.quantity ?? item?.qty ?? 1) || 1;

const getOrderItemPrice = (item) => {
  const quantity = getOrderItemQuantity(item);
  const unitPrice =
    item?.sellingPrice ??
    item?.price ??
    item?.salePrice ??
    item?.product?.sellingPrice ??
    item?.product?.price ??
    0;

  return Number(item?.subtotal ?? Number(unitPrice) * quantity) || 0;
};

const getStatusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["paid", "delivered", "completed"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (["shipped", "processing", "confirmed"].includes(value)) {
    return "border-[#0755E9]/25 bg-[#EFF6FF] text-[#0755E9]";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getStatusIcon = (status) => {
  const value = String(status || "").toLowerCase();
  if (["delivered", "completed", "paid"].includes(value)) return CheckCircle2;
  if (["cancelled", "failed", "refunded"].includes(value)) return XCircle;
  if (["shipped", "processing"].includes(value)) return Truck;
  return Clock3;
};

function OrdersContent() {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);
  const loading = useSelector(selectOrdersListLoading);
  const error = useSelector(selectOrdersListError);
  const cancellingOrderId = useSelector(selectCancellingOrderId);
  const cancelError = useSelector(selectOrderCancelError);

  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);

  const loadOrders = useCallback(() => {
    dispatch(fetchUserOrders({ limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleConfirmCancellation = async ({ orderId, reason, comment }) => {
    try {
      await dispatch(cancelUserOrder({ orderId, reason, comment })).unwrap();

      toast.success(
        `Order ${cancelOrderTarget?.orderNumber || orderId} cancelled.`,
      );
      setCancelOrderTarget(null);
      dispatch(clearCancelError());
    } catch {
      // Redux cancelError displays directly inside the modal
    }
  };

  const filterCounts = useMemo(() => {
    const counts = {
      All: orders.length,
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const status = String(order.orderStatus || "Pending").toLowerCase();
      const matching = ORDER_FILTERS.find(
        (f) => f !== "All" && f.toLowerCase() === status
      );
      if (matching) counts[matching] += 1;
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") return orders;
    return orders.filter(
      (order) =>
        String(order.orderStatus || "Pending").toLowerCase() ===
        activeFilter.toLowerCase()
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

  const handlePagination = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const summaryCards = [
    { label: "Total Orders", count: orders.length, icon: ClipboardList },
    { label: "Processing", count: filterCounts.Processing, icon: Clock3 },
    { label: "Shipped", count: filterCounts.Shipped, icon: Truck },
    { label: "Delivered", count: filterCounts.Delivered, icon: CheckCircle2 },
  ];

  return (
    <>
      <AccountShell
        activeSection="orders"
        breadcrumbLabel="My Orders"
        title="My Orders"
        description="Track deliveries, view order invoices, or manage pending orders."
        headerRight={
          !loading && !error && orders.length > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-bold text-[#101828] tabular-nums">
              <Package size={15} className="text-[#0755E9]" aria-hidden="true" />
              {orders.length} Total {orders.length === 1 ? "Order" : "Orders"}
            </span>
          ) : null
        }
      >
        {loading ? (
          <OrdersSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
              <RefreshCw size={24} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#101828]">
              Unable to load orders
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-[#64748B] sm:text-sm">
              {error}
            </p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
              <ShoppingBag size={28} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#101828]">
              No orders yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#64748B] sm:text-sm">
              You haven&apos;t placed any orders yet. Explore our latest gadgets and smart devices to get started.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-6 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:text-sm"
            >
              <ShoppingBag size={15} />
              <span>Start Shopping</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {summaryCards.map(({ label, count, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#64748B]">
                      {label}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-2.5 text-2xl font-extrabold text-[#101828] tabular-nums">
                    {count}
                  </p>
                </div>
              ))}
            </div>

            {/* Filter Strip */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Filter by Status
                </h2>
                <span className="text-xs font-semibold text-[#64748B] tabular-nums">
                  {filteredOrders.length} results
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ORDER_FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => handleFilterChange(filter)}
                      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
                        isActive
                          ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                          : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                      }`}
                    >
                      <span>{filter}</span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white text-[#64748B]"
                        }`}
                      >
                        {filterCounts[filter]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center">
                <Search size={28} className="mx-auto text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-[#101828]">
                  No {activeFilter.toLowerCase()} orders
                </h3>
                <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                  You don&apos;t have orders matching this status.
                </p>
                <button
                  type="button"
                  onClick={() => handleFilterChange("All")}
                  className="mt-4 rounded-xl bg-[#0755E9] px-4 py-2 text-xs font-bold text-white hover:bg-[#0645C4]"
                >
                  View All Orders
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => {
                  const orderId = order._id || order.id;
                  const orderNumber =
                    order.orderNumber || order.orderId || orderId;
                  const totalAmount =
                    order.totalAmount ?? order.total ?? order.grandTotal ?? 0;
                  const OrderStatusIcon = getStatusIcon(order.orderStatus);

                  return (
                    <article
                      key={orderId}
                      className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-shadow hover:shadow-xs"
                    >
                      <div className="p-4 sm:p-5">
                        {/* Order Top Meta */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                              Order ID
                            </p>
                            <h3 className="mt-0.5 break-all text-sm font-bold text-[#101828] sm:text-base">
                              {orderNumber}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]">
                              <CalendarDays size={13} aria-hidden="true" />
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                                order.orderStatus
                              )}`}
                            >
                              <OrderStatusIcon size={12} aria-hidden="true" />
                              {order.orderStatus || "Pending"}
                            </span>

                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                                order.paymentStatus
                              )}`}
                            >
                              Payment: {order.paymentStatus || "Pending"}
                            </span>

                            {order.orderStatus === "Cancelled" &&
                              (order.refundSummary?.status || order.refundStatus) &&
                              (order.refundSummary?.status || order.refundStatus) !==
                                "NOT_REQUIRED" && (
                                <span
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                                    getRefundStatusMeta(
                                      order.refundSummary?.status ||
                                        order.refundStatus,
                                      order.paymentStatus,
                                      order.paymentMethod
                                    ).badgeClasses
                                  }`}
                                >
                                  {
                                    getRefundStatusMeta(
                                      order.refundSummary?.status ||
                                        order.refundStatus,
                                      order.paymentStatus,
                                      order.paymentMethod
                                    ).label
                                  }
                                </span>
                              )}
                          </div>
                        </div>

                        {order.orderStatus === "Cancelled" &&
                          order.cancellationReason && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2 text-xs text-red-900">
                              <span>
                                <strong>Reason:</strong>{" "}
                                {order.cancellationReason}
                              </span>
                              {Number(
                                order.refundSummary?.amount ??
                                  order.refundAmount ??
                                  0
                              ) > 0 && (
                                <span className="font-bold text-[#0755E9]">
                                  Refund:{" "}
                                  {formatCurrencyINR(
                                    order.refundSummary?.amount ??
                                      order.refundAmount
                                  )}
                                </span>
                              )}
                            </div>
                          )}

                        {/* Items Preview */}
                        <div className="my-4 space-y-3 border-y border-[#E2E8F0] py-4">
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            order.items.slice(0, 2).map((item, idx) => {
                              const image = getOrderItemImage(item);
                              const quantity = getOrderItemQuantity(item);
                              const attrs =
                                item?.attributes &&
                                typeof item.attributes === "object"
                                  ? Object.entries(item.attributes)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(" · ")
                                  : "";

                              return (
                                <div
                                  key={item?._id || item?.product?._id || idx}
                                  className="flex min-w-0 items-center gap-3"
                                >
                                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                                    {image ? (
                                      <img
                                        src={image}
                                        alt={getOrderItemName(item)}
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <Package size={24} className="text-slate-300" />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-xs font-bold text-[#101828] sm:text-sm">
                                      {getOrderItemName(item)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#64748B]">
                                      Qty: {quantity}
                                      {attrs ? ` · ${attrs}` : ""}
                                    </p>
                                    <p className="mt-0.5 text-xs font-bold text-[#101828] tabular-nums sm:text-sm">
                                      {formatPrice(getOrderItemPrice(item))}
                                    </p>
                                  </div>

                                  {idx === 0 && order.items.length > 1 && (
                                    <span className="shrink-0 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-bold text-[#64748B]">
                                      +{order.items.length - 1} more
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-[#64748B]">
                              Order items summary unavailable
                            </p>
                          )}
                        </div>

                        {/* Payment & Total Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                              Payment Method
                            </p>
                            <p className="mt-0.5 text-xs font-bold text-[#101828] sm:text-sm">
                              {order.paymentMethod === "Online"
                                ? "Online Payment"
                                : order.paymentMethod || "N/A"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                              Total Amount
                            </p>
                            <p className="mt-0.5 text-base font-extrabold text-[#101828] tabular-nums">
                              {formatPrice(totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
                        <Link
                          href={`/account/orders/${orderId}`}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                        >
                          <span>View Details</span>
                          <ChevronRight size={14} aria-hidden="true" />
                        </Link>

                        {order.shipment?.shipmentId && (
                          <Link
                            href={`/account/orders/${orderId}/tracking`}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
                          >
                            <Truck size={14} aria-hidden="true" />
                            <span>Track Order</span>
                          </Link>
                        )}

                        {canCancelOrder(order) && (
                          <button
                            type="button"
                            onClick={() => {
                              dispatch(clearCancelError());
                              setCancelOrderTarget(order);
                            }}
                            disabled={cancellingOrderId === orderId}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:ml-auto"
                          >
                            <XCircle size={14} aria-hidden="true" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 sm:flex-row">
                <p className="text-xs font-medium text-[#64748B] tabular-nums">
                  Page{" "}
                  <span className="font-bold text-[#101828]">{currentPage}</span>{" "}
                  of{" "}
                  <span className="font-bold text-[#101828]">{totalPages}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePagination(currentPage - 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-45"
                  >
                    <ArrowLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePagination(currentPage + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#0755E9] px-3.5 text-xs font-bold text-white transition hover:bg-[#0645C4] disabled:opacity-45"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AccountShell>

      <CancelOrderModal
        key={
          cancelOrderTarget?._id || cancelOrderTarget?.id || "cancel-order-list"
        }
        order={cancelOrderTarget}
        open={Boolean(cancelOrderTarget)}
        loading={Boolean(cancellingOrderId)}
        error={cancelError || ""}
        onClose={() => {
          setCancelOrderTarget(null);
          dispatch(clearCancelError());
        }}
        onConfirm={handleConfirmCancellation}
      />
    </>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
