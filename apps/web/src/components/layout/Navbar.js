"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  MapPin,
  ChevronDown,
  Mic,
  Bell,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/store/thunks/authThunks";
import { fetchUnreadCount } from "@/store/thunks/notificationThunks";

export default function Navbar() {
  const router = useRouter();

  const { user, isAuthenticated, isInitialized, dispatch } = useAuth();

  const reduxDispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );

  const wishlistCount = wishlistProducts.length;

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      reduxDispatch(fetchUnreadCount());
    }
  }, [isInitialized, isAuthenticated, reduxDispatch]);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    router.push(`/products?search=${encodeURIComponent(value)}`);

    setSearch("");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());

    setAccountMenuOpen(false);
    setMobileMenuOpen(false);

    router.push("/login");
  };

  const badgeClass =
    "absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 py-2">
          {/* Logo & Location */}
          <div className="flex shrink-0 items-center gap-4">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-[#1D4ED8] sm:text-2xl"
            >
              MOBI<span className="text-[#0F172A]">HUB</span>
            </Link>

            <div className="hidden cursor-pointer items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 lg:flex">
              <MapPin size={14} className="text-[#1D4ED8]" />
              <span>Deliver to 10001</span>
              <ChevronDown size={12} />
            </div>
          </div>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden max-w-xl flex-1 lg:flex"
          >
            <div className="flex w-full items-center rounded-full bg-[#F8FAFC] px-4 py-2.5 transition-all focus-within:bg-white focus-within:shadow-[0_0_0_1px_#1D4ED8]">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tech accessories, brands, cables..."
                className="mx-3 w-full bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-slate-400"
              />

              <Mic size={18} className="shrink-0 text-slate-400" />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 xl:flex">
            <Link
              href="/"
              className="text-sm font-medium text-[#334155] transition hover:text-[#1D4ED8]"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="text-sm font-medium text-[#334155] transition hover:text-[#1D4ED8]"
            >
              Shop
            </Link>

            <Link
              href="/categories"
              className="text-sm font-medium text-[#334155] transition hover:text-[#1D4ED8]"
            >
              Categories
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount})`}
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              <Heart size={22} strokeWidth={1.8} />

              {wishlistCount > 0 && (
                <span className={badgeClass}>
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Shopping cart (${cartCount})`}
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              <ShoppingCart size={22} strokeWidth={1.8} />

              {cartCount > 0 && (
                <span className={badgeClass}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isInitialized && isAuthenticated && (
              <Link
                href="/account/notifications"
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative rounded-full p-2 text-slate-600 transition hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
              >
                <Bell size={22} strokeWidth={1.8} />

                {unreadCount > 0 && (
                  <span className={badgeClass}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Account */}
            {isInitialized && (
              <>
                {isAuthenticated ? (
                  <div className="relative hidden sm:block">
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen((prev) => !prev)}
                      className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#1D4ED8] text-white shadow-sm ring-2 ring-white transition hover:bg-blue-700"
                    >
                      <User size={18} strokeWidth={2.5} />
                    </button>

                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                        <div className="bg-[#F8FAFC] px-4 py-3">
                          <p className="truncate text-sm font-bold text-[#0F172A]">
                            {user?.name || "Account"}
                          </p>
                        </div>

                        <div className="p-2">
                          <Link
                            href="/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                          >
                            <User size={16} /> My Account
                          </Link>

                          <Link
                            href="/account/orders"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                          >
                            <Package size={16} /> My Orders
                          </Link>

                          <Link
                            href="/account/notifications"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                          >
                            <Bell size={16} /> Notifications
                            {unreadCount > 0 && (
                              <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Link
                      href="/login"
                      className="rounded-full px-4 py-2 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      className="rounded-full bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Join
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="ml-1 rounded-full p-2 text-slate-600 hover:bg-[#F8FAFC] lg:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Location */}
        <div className="pb-3 lg:hidden">
          <div className="mb-2 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
            <MapPin size={12} className="text-[#1D4ED8]" />
            <span>Deliver to 10001</span>
            <ChevronDown size={12} />
          </div>

          <form onSubmit={handleSearch}>
            <div className="flex items-center rounded-full bg-[#F8FAFC] px-4 py-2.5 shadow-inner">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tech accessories..."
                className="mx-3 w-full bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-slate-400"
              />

              <Mic size={18} className="shrink-0 text-slate-400" />
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-100 py-2 lg:hidden">
            <div className="flex flex-col gap-1 p-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
              >
                All Products
              </Link>

              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
              >
                Categories
              </Link>

              <div className="my-2 h-px w-full bg-slate-100" />

              {isInitialized && (
                <>
                  {isAuthenticated ? (
                    <>
                      <div className="mb-2 px-4 py-2">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="font-bold text-[#0F172A]">{user?.name}</p>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                      >
                        <User size={18} /> My Account
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                      >
                        <Package size={18} /> My Orders
                      </Link>

                      <Link
                        href="/account/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                      >
                        <span className="flex items-center gap-3">
                          <Bell size={18} /> Notifications
                        </span>

                        {unreadCount > 0 && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-3 px-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex justify-center rounded-full bg-[#F8FAFC] px-4 py-2.5 text-sm font-bold text-[#334155]"
                      >
                        Login
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex justify-center rounded-full bg-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                      >
                        Join Now
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
