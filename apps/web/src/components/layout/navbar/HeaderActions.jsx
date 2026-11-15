
"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import AccountDropdown from "./AccountDropdown";

function HeaderAction({ href, label, count = 0, icon: Icon }) {
  return (
    <Link
      href={href}
      aria-label={`${label}${count > 0 ? `, ${count} items` : ""}`}
      className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:h-11 sm:w-11 lg:h-11 lg:w-auto lg:gap-2.5 lg:px-3"
    >
      <span className="relative flex items-center justify-center">
        <Icon
          size={22}
          strokeWidth={1.8}
          className="transition-transform duration-200 group-hover:scale-110"
        />

        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[9px] font-bold leading-none text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>

      <span className="hidden text-[13px] font-semibold text-slate-700 transition-colors group-hover:text-blue-600 lg:block">
        {label}
      </span>
    </Link>
  );
}

export default function HeaderActions({
  user,
  isAuthenticated,
  cartCount = 0,
  wishlistCount = 0,
  unreadCount = 0,
  onLogout,
  onLogin,
  onRegister,
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

      {/* Wishlist */}
      <HeaderAction
        href="/wishlist"
        label="Wishlist"
        count={wishlistCount}
        icon={Heart}
      />

      {/* Shopping Bag */}
      <HeaderAction
        href="/cart"
        label="Shopping Bag"
        count={cartCount}
        icon={ShoppingBag}
      />

      {/* Desktop Divider */}
      <div className="hidden h-8 w-px bg-slate-200 xl:block" />

      {/* Account */}
      <div className="hidden items-center xl:flex">
        {isAuthenticated ? (
          <AccountDropdown
            user={user}
            unreadCount={unreadCount}
            onLogout={onLogout}
          />
        ) : (
          <div className="flex items-center gap-2">

            {/* Login Modal */}
            <button
              type="button"
              onClick={onLogin}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Login
            </button>

            {/* Register Modal */}
            <button
              type="button"
              onClick={onRegister}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Sign Up
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
