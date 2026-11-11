
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  Settings,
  Store,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
  label: "Brands",
  href: "/admin/brands",
  icon: Store,
},
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
 {
  label: "Customers",
  href: "/admin/users",
  icon: Users,
},
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <Link
        href="/admin"
        className="flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-200 px-6"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Store size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            MOBI HUB
          </h2>

          <p className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
            Administration
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Main Menu
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                size={19}
                className={
                  active
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }
              />

              <span>{item.label}</span>

              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">
            MOBI HUB Admin
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Manage your store efficiently.
          </p>
        </div>
      </div>
    </aside>
  );
}
