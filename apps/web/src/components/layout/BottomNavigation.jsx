
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

import {
  Home,
  Store,
  LayoutGrid,
  ClipboardList,
  UserRound,
} from "lucide-react";

const navigationItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/products", icon: Store },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  { label: "Orders", href: "/account/orders", icon: ClipboardList },
  { label: "Account", href: "/account", icon: UserRound },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const { isAuthenticated, isInitialized } = useAuth();

  const handleAccountClick = (event) => {
    if (!isInitialized || !isAuthenticated) {
      event.preventDefault();

      window.dispatchEvent(
        new CustomEvent("open-auth-modal", {
          detail: { modal: "login" },
        })
      );
    }
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl xl:hidden"
    >
      <div className="grid h-16 w-full grid-cols-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={
                item.label === "Account"
                  ? handleAccountClick
                  : undefined
              }
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span
                className={`absolute top-0 h-[3px] w-7 rounded-b-full bg-blue-600 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              <Icon
                size={21}
                strokeWidth={isActive ? 2.4 : 1.8}
              />

              <span
                className={`whitespace-nowrap text-[9px] sm:text-[10px] ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
