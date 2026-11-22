
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { logoutUser } from "@/store/thunks/authThunks";

// ========================================
// PAGE TITLES
// ========================================

const PAGE_TITLES = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/reviews": "Reviews",
  "/admin/banners": "Banners",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings",
};

// ========================================
// ADMIN HEADER
// ========================================

export default function AdminHeader({ onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ========================================
  // DYNAMIC PAGE TITLE
  // ========================================

  const pageTitle =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(
      ([path]) =>
        path !== "/admin" && pathname.startsWith(`${path}/`),
    )?.[1] ||
    "Admin Panel";

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await dispatch(logoutUser()).unwrap();

      router.replace("/login");
    } catch (error) {
      console.error("Admin logout failed:", error);
      setLoggingOut(false);
    }
  };

  // ========================================
  // ADMIN DETAILS
  // ========================================

  const adminName = user?.name || "Administrator";
  const adminEmail = user?.email || "admin@mobi-hub.com";

  // ========================================
  // UI
  // ========================================

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

      {/* LEFT SECTION */}
      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile Sidebar Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            {pageTitle}
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            MOBI HUB Admin Panel
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notifications */}
        <button
          type="button"
          onClick={() => router.push("/admin/notifications")}
          className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* ADMIN PROFILE */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-50 sm:gap-3"
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserCircle size={23} />
            </div>

            {/* Admin Name */}
            <div className="hidden text-left sm:block">
              <p className="max-w-[150px] truncate text-sm font-semibold text-slate-900">
                {adminName}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            {/* Dropdown Icon */}
            <ChevronDown
              size={16}
              className={`hidden text-slate-500 transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <>
              {/* Close Overlay */}
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              {/* Dropdown Content */}
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

                {/* Admin Information */}
                <div className="border-b border-slate-100 p-4">

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {adminName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {adminEmail}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <ShieldCheck size={13} />
                    Admin Account
                  </div>
                </div>

                {/* Logout */}
                <div className="p-2">
                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={17} />

                    {loggingOut
                      ? "Signing out..."
                      : "Logout"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
