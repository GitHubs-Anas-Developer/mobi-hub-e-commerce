"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  LayoutDashboard,
  UserRound,
  Package,
  MapPin,
  Heart,
  Lock,
  Bell,
  LogOut,
  BadgeCheck,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { logoutUser } from "@/store/thunks/authThunks";
import { clearCredentials } from "@/store/slices/authSlice";
import { resetCart } from "@/store/slices/cartSlice";
import { resetWishlist } from "@/store/slices/wishlistSlice";

function getInitials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "EL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AccountShell({
  activeSection = "overview",
  title = "My Account",
  description = "Manage your orders, addresses, profile, and security.",
  breadcrumbLabel = "",
  headerRight = null,
  children,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const unreadNotifications = useSelector((state) => {
    const unread = state.notifications?.unreadCount;
    if (typeof unread === "number") return unread;
    const list = state.notifications?.notifications;
    return Array.isArray(list) ? list.filter((n) => !n.isRead).length : 0;
  });

  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      id: "overview",
      label: "Account Overview",
      shortLabel: "Overview",
      href: "/account",
      icon: LayoutDashboard,
    },
    {
      id: "profile",
      label: "My Profile",
      shortLabel: "Profile",
      href: "/account/profile",
      icon: UserRound,
    },
    {
      id: "orders",
      label: "My Orders",
      shortLabel: "Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      id: "addresses",
      label: "Address Book",
      shortLabel: "Addresses",
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      id: "wishlist",
      label: "My Wishlist",
      shortLabel: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
    {
      id: "password",
      label: "Change Password",
      shortLabel: "Password",
      href: "/account/profile#password",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications & Settings",
      shortLabel: "Settings",
      href: "/account/notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : 0,
    },
  ];

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Clear local session credentials even if session already expired
    } finally {
      dispatch(clearCredentials());
      dispatch(resetCart());
      dispatch(resetWishlist());
      toast.success("Logged out successfully.");
      router.replace("/login");
    }
  };

  const initials = getInitials(user?.name);
  const breadcrumbItems = breadcrumbLabel
    ? [
        { label: "My Account", href: "/account" },
        { label: breadcrumbLabel },
      ]
    : [{ label: "My Account" }];

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        {/* Mobile & Tablet Horizontal Navigation Tabs */}
        <nav
          aria-label="Account navigation mobile"
          className="mb-5 flex items-center gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition ${
                  isActive
                    ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{item.shortLabel}</span>
                {item.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${
                      isActive
                        ? "bg-white text-[#0755E9]"
                        : "bg-[#0755E9] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {loggingOut ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} aria-hidden="true" />
            )}
            <span>Logout</span>
          </button>
        </nav>

        {/* Desktop Two-Column Account Architecture */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[276px_minmax(0,1fr)] xl:gap-8">
          {/* Left Desktop Sidebar */}
          <aside className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white lg:sticky lg:top-24 lg:block">
            {/* Customer Card */}
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0755E9] text-sm font-extrabold tracking-wide text-white shadow-xs">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-bold text-[#101828]">
                      {user?.name || "Customer"}
                    </p>
                    {user?.isEmailVerified && (
                      <BadgeCheck
                        size={14}
                        className="shrink-0 text-[#0755E9]"
                        aria-label="Verified Email"
                      />
                    )}
                  </div>

                  {user?.email && (
                    <p className="mt-0.5 truncate text-xs text-[#64748B]">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Links */}
            <nav aria-label="Account navigation" className="p-2.5">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`group flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-[#EFF6FF] text-[#0755E9]"
                            : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101828]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            size={17}
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-[#0755E9]"
                                : "text-[#64748B] group-hover:text-[#101828]"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.label}</span>
                        </span>

                        {item.badge > 0 && (
                          <span className="rounded-full bg-[#0755E9] px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer Logout & Quick Shop */}
            <div className="space-y-2 border-t border-[#E2E8F0] p-3">
              <Link
                href="/products"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              >
                <ShoppingBag size={14} aria-hidden="true" />
                <span>Continue Shopping</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} aria-hidden="true" />
                )}
                <span>{loggingOut ? "Signing Out..." : "Logout"}</span>
              </button>
            </div>
          </aside>

          {/* Right Content Column */}
          <div className="min-w-0 space-y-6">
            {/* Section Header Card */}
            <header className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-[#101828] sm:text-2xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                    {description}
                  </p>
                )}
              </div>

              {headerRight && <div className="shrink-0">{headerRight}</div>}
            </header>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

