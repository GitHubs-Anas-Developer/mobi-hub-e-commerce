
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  CreditCard,
  Truck,
  ArrowLeft,
  ShoppingBag,
  UserRound,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
} from "framer-motion";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import orderService from "@/services/orderService";
import OrderDetailsSkeleton from "@/components/loading/skeletons/OrderDetailsSkeleton";

/* ---------------------------------
   Helpers
---------------------------------- */

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["paid", "delivered"].includes(value)) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (["processing", "shipped", "confirmed"].includes(value)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
};

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return "";

  // Current schema: { url, publicId }
  if (typeof thumbnail === "object") {
    return thumbnail.url || "";
  }

  // Backward compatibility for older orders saved with a URL string.
  if (typeof thumbnail === "string") {
    const value = thumbnail.trim();

    if (value.startsWith("https://") || value.startsWith("http://")) {
      return value;
    }

    // Support legacy records where an object was accidentally stringified.
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null
        ? parsed.url || ""
        : "";
    } catch {
      return "";
    }
  }

  return "";
};

/* ---------------------------------
   Animation Variants
---------------------------------- */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

/* ---------------------------------
   Reusable Components
---------------------------------- */

function SectionCard({ icon: Icon, title, children }) {
  return (
    <motion.section
      variants={cardVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
    >
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-5 sm:px-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
          <Icon size={20} />
        </div>

        <h2 className="text-base font-bold text-[#101828] sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="p-5 sm:p-7">{children}</div>
    </motion.section>
  );
}

function DetailRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[#64748B]">{label}</span>
      <span className={`text-right font-semibold text-[#101828] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------
   Order Success Content
---------------------------------- */

function OrderSuccessContent() {
  const params = useParams();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await orderService.getOrderById(orderId);

        const orderData =
          response?.data?.data || response?.data || response;

        if (!orderData?._id) {
          throw new Error("Invalid order response.");
        }

        if (isMounted) {
          setOrder(orderData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load order details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!orderId || typeof orderId !== "string") {
      setOrder(null);
      setError("Order ID is missing from the URL.");
      setLoading(false);
    } else {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  /* Loading State */

 /* Loading State */
if (loading) {
  return <OrderDetailsSkeleton />;
}

  /* Error State */

  if (error || !order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-4 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle size={32} />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-[#101828]">
          Unable to load order
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#64748B]">
          {error || "Order not found."}
        </p>

        <Link
          href="/account/orders"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
        >
          <ArrowLeft size={17} />
          Back to My Orders
        </Link>
      </motion.div>
    );
  }

  /* Order Data */

  const isCOD = order.paymentMethod === "COD";
  const isPaid = order.paymentStatus === "Paid";
  const isCancelled = order.orderStatus === "Cancelled";

  const address = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const attributes = (value) => {
    if (!value) return [];

    if (value instanceof Map) {
      return Array.from(value.entries());
    }

    return Object.entries(value);
  };

  return (
    <div className="relative">
      {/* Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Back Navigation */}

        <motion.div variants={itemVariants}>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] transition hover:text-[#0755E9]"
          >
            <ArrowLeft size={17} />
            Back to My Orders
          </Link>
        </motion.div>

        {/* Order Header */}

        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-full rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 12,
                delay: 0.2,
              }}
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                isCancelled
                  ? "bg-red-50 text-red-500"
                  : "bg-[#EFF6FF] text-[#0755E9]"
              }`}
            >
              {isCancelled ? (
                <AlertCircle size={42} />
              ) : (
                <CheckCircle2 size={42} />
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl"
            >
              {isCancelled
                ? "Order Cancelled"
                : "Order Placed Successfully!"}
            </motion.h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#64748B]">
              {isCancelled
                ? "This order has been cancelled."
                : "Thank you for shopping with MOBI HUB. Your order details are shown below."}
            </p>

            {!isCancelled && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                <ShieldCheck size={15} />
                Your order details are ready
              </div>
            )}
          </div>

          {/* Order Information */}

          <div className="relative mt-9 grid grid-cols-1 gap-4 rounded-xl bg-[#F8FAFC] p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-xs font-medium text-[#64748B]">
                Order Number
              </p>

              <p className="mt-2 break-all text-sm font-bold text-[#101828]">
                {order.orderNumber || order._id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#64748B]">
                Order Date
              </p>

              <p className="mt-2 text-sm font-semibold text-[#101828]">
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#64748B]">
                Order Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus || "Pending"}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-[#64748B]">
                Payment Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus || "Pending"}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Order Items */}

        <SectionCard
          icon={Package}
          title={`Order Items (${items.length})`}
        >
          {items.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              No item details available.
            </p>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {items.map((item, index) => (
                <motion.div
                  key={item.variantId || index}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
                >
                  {/* Product Image */}

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    {getThumbnailUrl(item.thumbnail) ? (
                      <img
                        src={getThumbnailUrl(item.thumbnail)}
                        alt={item.productName || "Product"}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <Package size={30} className="text-[#94A3B8]" />
                    )}
                  </div>

                  {/* Product Details */}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#101828]">
                      {item.productName || "Product"}
                    </h3>

                    <p className="mt-1 text-xs text-[#64748B]">
                      SKU: {item.sku || "N/A"}
                    </p>

                    {attributes(item.attributes).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {attributes(item.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#0755E9]"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                      <span>Qty: {item.quantity}</span>

                      <span>
                        Price: {formatPrice(item.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Subtotal */}

                  <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-xs text-[#64748B]">
                      Subtotal
                    </p>

                    <p className="mt-1 font-bold text-[#101828]">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Delivery Address */}

        <SectionCard
          icon={MapPin}
          title="Delivery Address"
        >
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                <MapPin size={19} />
              </div>

              <div className="min-w-0">
                <p className="font-bold text-[#101828]">
                  {address.fullName || "N/A"}
                </p>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                  {address.landmark && `, ${address.landmark}`}
                  <br />
                  {address.city}, {address.state} - {address.pincode}
                  <br />
                  {address.country}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-[#64748B]">
                    Phone:{" "}
                    <span className="font-semibold text-[#101828]">
                      {address.phone || "N/A"}
                    </span>
                  </p>

                  {address.alternatePhone && (
                    <p className="text-sm text-[#64748B]">
                      Alternate Phone:{" "}
                      <span className="font-semibold text-[#101828]">
                        {address.alternatePhone}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Payment and Price Summary */}

        <SectionCard
          icon={CreditCard}
          title="Payment & Price Details"
        >
          <div className="space-y-5">
            {/* Payment Information */}

            <div className="space-y-4">
              <DetailRow
                label="Payment Method"
                value={isCOD ? "Cash on Delivery" : "Online Payment"}
              />

              <DetailRow
                label="Payment Status"
                value={order.paymentStatus || "Pending"}
                valueClass={
                  isPaid ? "text-green-600" : "text-amber-600"
                }
              />
            </div>

            <div className="border-t border-[#E2E8F0] pt-5">
              <div className="space-y-4">
                <DetailRow
                  label="Subtotal"
                  value={formatPrice(order.subtotal)}
                />

                <DetailRow
                  label="Shipping Fee"
                  value={
                    Number(order.shippingFee) === 0
                      ? "Free"
                      : formatPrice(order.shippingFee)
                  }
                  valueClass={
                    Number(order.shippingFee) === 0
                      ? "text-green-600"
                      : ""
                  }
                />

                {Number(order.discount) > 0 && (
                  <DetailRow
                    label={`Discount${
                      order.coupon?.code
                        ? ` (${order.coupon.code})`
                        : ""
                    }`}
                    value={`-${formatPrice(order.discount)}`}
                    valueClass="text-green-600"
                  />
                )}
              </div>
            </div>

            {/* Total */}

            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#EFF6FF] p-5">
              <div>
                <p className="text-sm font-bold text-[#101828]">
                  Total Amount
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Including applicable charges
                </p>
              </div>

              <p className="text-xl font-extrabold text-[#0755E9] sm:text-2xl">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Payment Messages */}

          <AnimatePresence mode="wait">
            {isCOD && !isPaid && !isCancelled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700"
              >
                <Truck size={19} className="mt-0.5 shrink-0" />

                <p>
                  You can pay when your order is delivered.
                </p>
              </motion.div>
            )}

            {!isCOD && !isPaid && !isCancelled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700"
              >
                <Clock size={19} className="mt-0.5 shrink-0" />

                <p>
                  Your online payment is not confirmed yet. Please check your
                  payment status before trying again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        {/* Action Buttons */}

        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap"
        >
          {!isCancelled && order.shipment?.shipmentId && (
            <Link
              href={`/order-success/${order._id}/tracking`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0645C4]"
            >
              <Truck size={17} />
              Track Your Shipment
              <ArrowRight size={16} />
            </Link>
          )}

          <Link
            href="/account/orders"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0645C4] hover:shadow-lg hover:shadow-blue-500/20"
          >
            <ShoppingBag size={17} />
            My Orders
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3.5 text-sm font-semibold text-[#101828] transition hover:border-[#0755E9] hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <UserRound size={17} />
            My Account
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3.5 text-sm font-semibold text-[#101828] transition hover:border-[#0755E9] hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------------------------------
   Main Page
---------------------------------- */

export default function OrderSuccessPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white py-6 sm:py-10">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-14">
          <OrderSuccessContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}
