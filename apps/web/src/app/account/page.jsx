"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  Heart,
  Bell,
  ArrowRight,
  ShoppingBag,
  Truck,
  ChevronRight,
  UserRound,
  Lock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountShell from "@/components/account/AccountShell";
import AccountSkeleton from "@/components/loading/skeletons/AccountSkeleton";
import WishlistProductCard from "@/components/wishlist/WishlistProductCard";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

import orderService from "@/services/orderService";
import addressService from "@/services/addressService";
import notificationService from "@/services/notificationService";
import {
  fetchWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";
import { addToCart } from "@/store/thunks/cartThunks";

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

const getStatusBadgeClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (["paid", "delivered", "confirmed"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (["shipped", "processing"].includes(value)) {
    return "border-[#0755E9]/25 bg-[#EFF6FF] text-[#0755E9]";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

function AccountOverviewContent() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const wishlistProducts = useSelector(
    (state) => state.wishlist?.products || []
  );
  const wishlistMutating = useSelector(
    (state) => state.wishlist?.isMutating ?? false
  );

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const [removingWishId, setRemovingWishId] = useState("");
  const [addingWishId, setAddingWishId] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setOverviewError("");

    try {
      const [ordersRes, addressesRes, unreadRes] = await Promise.allSettled([
        orderService.getOrders(),
        addressService.getAddresses(),
        notificationService.getUnreadCount(),
      ]);

      dispatch(fetchWishlist());

      if (ordersRes.status === "fulfilled") {
        const res = ordersRes.value;
        const list =
          res?.data?.orders ||
          res?.data?.data ||
          res?.data ||
          res?.orders ||
          [];
        setOrders(Array.isArray(list) ? list : []);
      }

      if (addressesRes.status === "fulfilled") {
        const res = addressesRes.value;
        const list =
          res?.data?.addresses ||
          res?.data?.data ||
          res?.addresses ||
          res?.data ||
          [];
        setAddresses(Array.isArray(list) ? list : []);
      }

      if (unreadRes.status === "fulfilled") {
        const count =
          unreadRes.value?.data?.unreadCount ??
          unreadRes.value?.unreadCount ??
          0;
        setUnreadCount(Number(count) || 0);
      }

      if (
        ordersRes.status === "rejected" &&
        addressesRes.status === "rejected"
      ) {
        setOverviewError("Unable to load some account details right now.");
      }
    } catch {
      setOverviewError("Unable to load your account dashboard.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0] || null,
    [addresses]
  );
  const previewWishlist = useMemo(
    () => wishlistProducts.slice(0, 4),
    [wishlistProducts]
  );

  const handleRemoveWishlist = async (productId) => {
    if (!productId || removingWishId) return;
    setRemovingWishId(productId);
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success("Removed from wishlist.");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Unable to remove item."
      );
    } finally {
      setRemovingWishId("");
    }
  };

  const handleAddToCartFromWishlist = async (product) => {
    const productId = product?._id || product?.id;
    if (!productId || addingWishId) return;

    const activeVariants = Array.isArray(product?.variants)
      ? product.variants.filter((v) => v?.isActive !== false)
      : [];
    const selectedVariant =
      activeVariants.find((v) => v?.isDefault) || activeVariants[0];

    if (!selectedVariant?._id || Number(selectedVariant.stock ?? 0) < 1) {
      toast.error("Please view product page to select an available variant.");
      return;
    }

    setAddingWishId(productId);
    try {
      await dispatch(
        addToCart({
          productId,
          variantId: selectedVariant._id,
          quantity: 1,
        })
      ).unwrap();
      toast.success(`${product.name || "Product"} added to cart.`);
      setCartDrawerOpen(true);
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Unable to add to cart."
      );
    } finally {
      setAddingWishId("");
    }
  };

  const summaryStats = [
    {
      label: "Total Orders",
      value: orders.length,
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "Saved Addresses",
      value: addresses.length,
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: "Wishlist Items",
      value: wishlistProducts.length,
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "Notifications",
      value: unreadCount,
      href: "/account/notifications",
      icon: Bell,
    },
  ];

  return (
    <>
      <AccountShell
        activeSection="overview"
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Customer"}`}
        description="View your recent ELENZO orders, saved delivery addresses, wishlist items, and account shortcuts."
      >
        {loading ? (
          <AccountSkeleton />
        ) : (
          <div className="space-y-6">
            {overviewError && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{overviewError}</span>
                </div>
                <button
                  type="button"
                  onClick={loadDashboardData}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100"
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            )}

            {/* Account Summary KPI Cards */}
            <section
              aria-label="Account summary metrics"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
            >
              {summaryStats.map(({ label, value, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-all hover:border-[#0755E9]/40 hover:shadow-xs sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#64748B]">
                      {label}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9] transition group-hover:bg-[#0755E9] group-hover:text-white">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-[#101828] tabular-nums">
                    {value}
                  </p>
                </Link>
              ))}
            </section>

            {/* Recent Orders Card */}
            <section
              aria-labelledby="recent-orders-heading"
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="recent-orders-heading"
                    className="text-base font-bold text-[#101828] sm:text-lg"
                  >
                    Recent Orders
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Your latest order activity and tracking shortcuts
                  </p>
                </div>

                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0755E9] hover:text-[#082B70] sm:text-sm"
                >
                  <span>View All Orders</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                    <ShoppingBag size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#101828]">
                    No orders placed yet
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Explore our electronics and gadgets catalog to place your first order.
                  </p>
                  <Link
                    href="/products"
                    className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const orderId = order._id || order.id;
                    const firstItem = order.items?.[0];
                    const thumb =
                      firstItem?.thumbnail?.url ||
                      firstItem?.thumbnail ||
                      firstItem?.product?.thumbnail?.url ||
                      "";
                    const itemName =
                      firstItem?.productName ||
                      firstItem?.product?.name ||
                      "Order Item";

                    return (
                      <div
                        key={orderId}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/60 p-4 transition hover:border-[#0755E9]/35 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-1.5">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={itemName}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Package size={22} className="text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-xs font-bold text-[#101828] sm:text-sm">
                                {order.orderNumber || orderId}
                              </p>
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(
                                  order.orderStatus
                                )}`}
                              >
                                {order.orderStatus || "Pending"}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs text-[#64748B]">
                              {itemName}
                              {order.items?.length > 1
                                ? ` +${order.items.length - 1} more`
                                : ""}
                            </p>

                            <p className="mt-1 text-[11px] font-medium text-[#64748B] tabular-nums">
                              Placed {formatDate(order.createdAt)} ·{" "}
                              <span className="font-bold text-[#101828]">
                                {formatPrice(order.totalAmount)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                          {order.shipment?.shipmentId && (
                            <Link
                              href={`/account/orders/${orderId}/tracking`}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-3 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
                            >
                              <Truck size={13} aria-hidden="true" />
                              <span>Track</span>
                            </Link>
                          )}

                          <Link
                            href={`/account/orders/${orderId}`}
                            className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:text-[#0755E9]"
                          >
                            <span>Details</span>
                            <ChevronRight size={14} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Saved Address + Profile Quick Links Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Saved Address Snapshot */}
              <section
                aria-labelledby="saved-address-summary"
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2
                      id="saved-address-summary"
                      className="text-base font-bold text-[#101828]"
                    >
                      Default Delivery Address
                    </h2>
                    <Link
                      href="/account/addresses"
                      className="text-xs font-bold text-[#0755E9] hover:underline"
                    >
                      Manage
                    </Link>
                  </div>

                  {defaultAddress ? (
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#101828]">
                          {defaultAddress.fullName}
                        </p>
                        {defaultAddress.addressType && (
                          <span className="rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                            {defaultAddress.addressType}
                          </span>
                        )}
                        {defaultAddress.isDefault && (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                        {[
                          defaultAddress.addressLine1,
                          defaultAddress.addressLine2,
                          defaultAddress.city,
                          defaultAddress.state,
                          defaultAddress.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      {defaultAddress.phone && (
                        <p className="mt-2 text-xs font-semibold text-[#101828] tabular-nums">
                          Phone: {defaultAddress.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-5 text-center">
                      <p className="text-xs text-[#64748B]">
                        No delivery addresses saved yet.
                      </p>
                      <Link
                        href="/account/addresses"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0755E9] hover:underline"
                      >
                        Add Address <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/account/addresses"
                  className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                >
                  <MapPin size={14} aria-hidden="true" />
                  <span>Open Address Book ({addresses.length})</span>
                </Link>
              </section>

              {/* Profile & Account Security Snapshot */}
              <section
                aria-labelledby="account-quick-access"
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
              >
                <div>
                  <h2
                    id="account-quick-access"
                    className="mb-4 text-base font-bold text-[#101828]"
                  >
                    Account &amp; Security Shortcuts
                  </h2>

                  <div className="space-y-2.5">
                    <Link
                      href="/account/profile"
                      className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF]/60"
                    >
                      <div className="flex items-center gap-3">
                        <UserRound size={17} className="text-[#0755E9]" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-[#101828]">
                            Edit Profile Details
                          </p>
                          <p className="text-[11px] text-[#64748B]">
                            {user?.name || "Manage name & phone"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#64748B]" />
                    </Link>

                    <Link
                      href="/account/profile#password"
                      className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF]/60"
                    >
                      <div className="flex items-center gap-3">
                        <Lock size={17} className="text-[#0755E9]" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-[#101828]">
                            Change Account Password
                          </p>
                          <p className="text-[11px] text-[#64748B]">
                            Keep your ELENZO login secure
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#64748B]" />
                    </Link>

                    <Link
                      href="/account/notifications"
                      className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF]/60"
                    >
                      <div className="flex items-center gap-3">
                        <Bell size={17} className="text-[#0755E9]" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-[#101828]">
                            Notification Inbox
                          </p>
                          <p className="text-[11px] text-[#64748B]">
                            {unreadCount > 0
                              ? `${unreadCount} unread updates`
                              : "All caught up"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#64748B]" />
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            {/* Saved Wishlist Quick Grid */}
            <section
              aria-labelledby="account-wishlist-heading"
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="account-wishlist-heading"
                    className="text-base font-bold text-[#101828] sm:text-lg"
                  >
                    Saved in Wishlist
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Move favourite gadgets to your cart anytime
                  </p>
                </div>

                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0755E9] hover:text-[#082B70] sm:text-sm"
                >
                  <span>View Full Wishlist ({wishlistProducts.length})</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {previewWishlist.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                    <Heart size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#101828]">
                    Your wishlist is empty
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Save electronics and gadgets while browsing to compare later.
                  </p>
                  <Link
                    href="/products"
                    className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                  >
                    <span>Explore Products</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {previewWishlist.map((product) => {
                    const pid = product._id || product.id;
                    if (!pid) return null;

                    return (
                      <div key={pid} className="min-w-0">
                        <WishlistProductCard
                          product={product}
                          isMutating={wishlistMutating}
                          isRemoving={String(removingWishId) === String(pid)}
                          isAdding={String(addingWishId) === String(pid)}
                          onRemove={handleRemoveWishlist}
                          onAddToCart={handleAddToCartFromWishlist}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </AccountShell>

      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountOverviewContent />
    </ProtectedRoute>
  );
}
