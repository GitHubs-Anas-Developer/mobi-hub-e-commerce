
"use client";

import Link from "next/link";
import {
  User,
  Package,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";

export default function AccountDropdown({
  user,
  unreadCount = 0,
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click and Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems = [
    {
      label: "My Account",
      href: "/account",
      icon: User,
    },
    {
      label: "My Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "Notifications",
      href: "/account/notifications",
      icon: Bell,
      badge: unreadCount,
    },
  ];

  return (
    <div ref={dropdownRef} className="relative hidden sm:block">

      {/* Account Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 ${
          isOpen
            ? "border-blue-100 bg-blue-50"
            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
        }`}
      >
        {/* Avatar */}
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <User size={21} strokeWidth={1.9} />
        </span>

        {/* User Details */}
        <span className="hidden text-left lg:block">
          <span className="block text-[11px] font-medium text-slate-500">
            Welcome back
          </span>

          <span className="block max-w-[110px] truncate text-sm font-bold text-slate-900">
            {user?.name || "My Account"}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`hidden text-slate-400 transition-transform duration-200 lg:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-3 w-[270px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
          role="menu"
        >

          {/* Profile Header */}
          <div className="relative overflow-hidden bg-blue-600 px-5 py-5">
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 right-12 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white">
                <User size={23} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-blue-100">
                  Welcome to ELEZIO
                </p>

                <p className="mt-1 truncate text-sm font-bold text-white">
                  {user?.name || "My Account"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2.5">
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              My Dashboard
            </p>

            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-blue-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                        <Icon size={19} strokeWidth={1.9} />
                      </span>

                      <span className="text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-700">
                        {item.label}
                      </span>
                    </span>

                    <span className="flex items-center gap-2">
                      {item.badge > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}

                      <ChevronRight
                        size={15}
                        className="text-slate-300 transition-colors group-hover:text-blue-600"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-red-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <LogOut size={19} />
              </span>

              <span className="text-sm font-semibold text-red-600">
                Logout
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-center text-[10px] font-medium text-slate-400">
              ELEZIO · Your Trusted Tech Store
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
