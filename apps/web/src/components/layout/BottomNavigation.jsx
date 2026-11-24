
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  {
    label: "Orders",
    href: "/account/orders",
    icon: ClipboardList,
    protected: true,
  },
  {
    label: "Account",
    href: "/account",
    icon: UserRound,
    protected: true,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, isInitialized } = useAuth();

  // Hide bottom navigation on product detail pages.
  const isProductDetailPage =
    /^\/products\/[^/]+\/?$/.test(pathname);

  if (isProductDetailPage) {
    return null;
  }

  const handleNavigation = (event, item) => {
    if (!item.protected) return;

    event.preventDefault();

    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(item.href)}`
      );
      return;
    }

    router.push(item.href);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="
        fixed inset-x-0 bottom-0 z-50 w-full
        border-t border-slate-200/80
        bg-white/95
        pb-[env(safe-area-inset-bottom)]
        shadow-[0_-4px_20px_rgba(15,23,42,0.06)]
        backdrop-blur-xl xl:hidden
      "
    >
      <div className="grid h-[60px] w-full grid-cols-5">
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
              onClick={(event) =>
                handleNavigation(event, item)
              }
              aria-current={isActive ? "page" : undefined}
              className={`
                relative flex min-w-0
                flex-col items-center justify-center
                gap-1 transition-colors duration-200
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                }
              `}
            >
              <span
                className={`
                  absolute top-0 h-[3px] w-7
                  rounded-b-full bg-blue-600
                  transition-opacity
                  ${isActive ? "opacity-100" : "opacity-0"}
                `}
              />

              <Icon
                size={20}
                strokeWidth={isActive ? 2.3 : 1.8}
                aria-hidden="true"
              />

              <span
                className={`
                  whitespace-nowrap text-[10px]
                  ${
                    isActive
                      ? "font-semibold"
                      : "font-medium"
                  }
                `}
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
