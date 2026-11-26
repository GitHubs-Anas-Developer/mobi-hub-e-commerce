
"use client";

import Link from "next/link";
import {
  Home,
  ShoppingBag,
  User,
  Package,
  Bell,
  Heart,
  ShoppingCart,
  LogIn,
  UserPlus,
  LogOut,
  X,
  ChevronRight,
  Smartphone,
} from "lucide-react";

export default function MobileMenu({
  isOpen,
  setIsOpen,
  user,
  isAuthenticated,
  cartCount = 0,
  wishlistCount = 0,
  unreadCount = 0,
  onLogout,
  onLogin,
  onRegister,
}) {
  const closeMenu = () => setIsOpen(false);

  const handleLogin = () => {
    closeMenu();
    onLogin?.();
  };

  const handleRegister = () => {
    closeMenu();
    onRegister?.();
  };

  const handleLogout = () => {
    closeMenu();
    onLogout?.();
  };

  const menuItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Shop Products", href: "/products", icon: ShoppingBag },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      count: wishlistCount,
    },
    {
      label: "Shopping Cart",
      href: "/cart",
      icon: ShoppingCart,
      count: cartCount,
    },
  ];

  const accountItems = [
    { label: "My Account", href: "/account", icon: User },
    { label: "My Orders", href: "/account/orders", icon: Package },
    {
      label: "Notifications",
      href: "/account/notifications",
      icon: Bell,
      count: unreadCount,
    },
  ];

  const renderMenuItem = (item) => {
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeMenu}
        className="group flex items-center justify-between rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-blue-50 active:bg-blue-100"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-[#0755e9]">
            <Icon size={20} strokeWidth={1.9} />
          </span>

          <span className="truncate text-sm font-semibold text-slate-800 group-hover:text-[#0755e9]">
            {item.label}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          {item.count > 0 && (
            <span className="min-w-6 rounded-full bg-red-50 px-2 py-1 text-center text-[11px] font-bold text-red-600">
              {item.count > 99 ? "99+" : item.count}
            </span>
          )}

          <ChevronRight
            size={17}
            className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#0755e9]"
          />
        </span>
      </Link>
    );
  };

  return (
    <div
      id="mobile-navigation"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={`fixed inset-0 z-[100] h-[100dvh] overflow-hidden bg-white transition-all duration-300 ease-in-out xl:hidden ${
        isOpen
          ? "visible translate-x-0 opacity-100"
          : "invisible translate-x-full opacity-0"
      }`}
    >
      {/* Header */}
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:h-[76px] sm:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0755e9] text-white">
            <Smartphone size={22} />
          </span>

          <span>
            <span className="block text-lg font-extrabold tracking-tight text-slate-900">
              Mobi <span className="text-[#0755e9]">Hub</span>
            </span>

            <span className="block text-[10px] font-medium tracking-wide text-slate-400">
              MOBILE ACCESSORIES STORE
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={closeMenu}
          aria-label="Close menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
        >
          <X size={21} />
        </button>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100dvh-68px)] flex-col overflow-y-auto overscroll-contain bg-white sm:h-[calc(100dvh-76px)]">
        <div className="mx-auto w-full max-w-[600px] flex-1 px-4 py-5 sm:px-6">

          {/* User Profile */}
          {isAuthenticated && (
            <div className="relative mb-7 overflow-hidden rounded-2xl border border-blue-100 bg-white p-4">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-50" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0755e9] text-white">
                  <User size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Welcome back!
                  </p>

                  <h3 className="mt-1 truncate text-base font-bold text-slate-900">
                    {user?.name || "My Account"}
                  </h3>

                  {user?.email && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shopping */}
          <section>
            <div className="mb-3 flex items-center justify-between px-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
                Shopping
              </h4>

              <span className="text-[11px] font-medium text-slate-400">
                Explore store
              </span>
            </div>

            <nav className="space-y-1" aria-label="Shopping navigation">
              {menuItems.map(renderMenuItem)}
            </nav>
          </section>

          {/* Account */}
          {isAuthenticated && (
            <section className="mt-6 border-t border-slate-100 pt-5">
              <h4 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
                My Account
              </h4>

              <nav className="space-y-1" aria-label="Account navigation">
                {accountItems.map(renderMenuItem)}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-red-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <LogOut size={20} />
                </span>

                <span className="text-sm font-semibold text-red-600">
                  Logout
                </span>
              </button>
            </section>
          )}

          {/* Guest Actions */}
          {!isAuthenticated && (
            <section className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleLogin}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-[#0755e9] hover:bg-blue-50"
              >
                <LogIn size={18} />
                Login
              </button>

              <button
                type="button"
                onClick={handleRegister}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0755e9] text-sm font-semibold text-white transition hover:bg-[#0645c4]"
              >
                <UserPlus size={18} />
                Register
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-5 text-center">
          <p className="text-sm font-bold text-slate-700">
            Mobi Hub
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Accessories for your everyday tech.
          </p>
        </div>
      </div>
    </div>
  );
}
