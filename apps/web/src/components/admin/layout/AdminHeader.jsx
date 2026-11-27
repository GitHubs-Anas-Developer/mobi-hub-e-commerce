"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Badge, Button, Dropdown, Input, Popover, Space, Tag } from "antd";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

import { BRAND_ADMIN_EMAIL } from "@/config/brand";
import { logoutUser } from "@/store/thunks/authThunks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/store/thunks/notificationThunks";
import {
  ALL_ADMIN_NAV_ITEMS,
  resolveAdminPageMeta,
} from "@/components/admin/layout/adminNavigation";

export default function AdminHeader({
  collapsed = false,
  onToggleCollapse,
  onOpenMobileDrawer,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { notifications = [], unreadCount = 0 } = useSelector(
    (state) => state.notifications,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { title } = resolveAdminPageMeta(pathname);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications({ page: 1, limit: 6 }));
  }, [dispatch]);

  const trimmedQuery = searchTerm.trim();

  const matchingModules = useMemo(() => {
    if (!trimmedQuery) {
      return ALL_ADMIN_NAV_ITEMS.slice(0, 6);
    }
    const lower = trimmedQuery.toLowerCase();
    return ALL_ADMIN_NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower),
    ).slice(0, 6);
  }, [trimmedQuery]);

  const navigateWithQuery = (path) => {
    setSearchOpen(false);
    router.push(path);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && trimmedQuery) {
      if (matchingModules.length > 0) {
        navigateWithQuery(matchingModules[0].href);
      } else {
        navigateWithQuery(
          `/admin/orders?search=${encodeURIComponent(trimmedQuery)}`,
        );
      }
    }
  };

  const searchContent = (
    <div className="w-[290px] sm:w-[340px]">
      {trimmedQuery && (
        <div className="mb-3 space-y-1 border-b border-[#E2E8F0] pb-3">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Search Records
          </p>
          <button
            type="button"
            onClick={() =>
              navigateWithQuery(
                `/admin/orders?search=${encodeURIComponent(trimmedQuery)}`,
              )
            }
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <ShoppingCart size={15} className="text-[#0755E9]" />
            <span>
              Search Orders for &ldquo;{trimmedQuery}&rdquo;
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              navigateWithQuery(
                `/admin/products?search=${encodeURIComponent(trimmedQuery)}`,
              )
            }
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <Package size={15} className="text-[#0755E9]" />
            <span>
              Search Products for &ldquo;{trimmedQuery}&rdquo;
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              navigateWithQuery(
                `/admin/users?search=${encodeURIComponent(trimmedQuery)}`,
              )
            }
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <Users size={15} className="text-[#0755E9]" />
            <span>
              Search Customers for &ldquo;{trimmedQuery}&rdquo;
            </span>
          </button>
        </div>
      )}

      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {trimmedQuery ? "Matching Sections" : "Quick Navigation"}
      </p>

      <div className="max-h-56 space-y-0.5 overflow-y-auto">
        {matchingModules.length === 0 ? (
          <p className="px-2 py-3 text-xs text-[#64748B]">
            No matching navigation section. Press Enter to search orders.
          </p>
        ) : (
          matchingModules.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.href}-${item.label}`}
                type="button"
                onClick={() => navigateWithQuery(item.href)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-[#F8FAFC]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF] text-[#0755E9]">
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-[#101828]">
                    {item.label}
                  </span>
                  <span className="block truncate text-[11px] text-[#64748B]">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification._id));
    }
    setNotifOpen(false);
    if (notification.relatedModel === "Order" && notification.relatedId) {
      router.push(`/admin/orders/${notification.relatedId}`);
    } else {
      router.push("/admin/notifications");
    }
  };

  const notificationContent = (
    <div className="w-[300px] sm:w-[340px]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#101828]">
            Notifications
          </span>
          {unreadCount > 0 && (
            <Tag color="blue" className="!m-0 !text-[11px] !font-bold">
              {unreadCount} new
            </Tag>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckCheck size={14} />}
            onClick={() => dispatch(markAllNotificationsAsRead())}
            className="!px-1 !text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="my-2 max-h-72 divide-y divide-[#F1F5F9] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No recent notifications
          </div>
        ) : (
          notifications.slice(0, 6).map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => handleNotificationClick(item)}
              className={`flex w-full items-start gap-2.5 px-2 py-2.5 text-left transition hover:bg-[#F8FAFC] ${
                !item.isRead ? "bg-[#EFF6FF]/40" : ""
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.isRead ? "bg-slate-300" : "bg-[#0755E9]"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#101828]">
                  {item.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] text-[#64748B]">
                  {item.message}
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      <div className="border-t border-[#E2E8F0] pt-2 text-center">
        <Button
          type="link"
          size="small"
          onClick={() => {
            setNotifOpen(false);
            router.push("/admin/notifications");
          }}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );

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

  const adminName = user?.name || "Administrator";
  const adminEmail = user?.email || BRAND_ADMIN_EMAIL;
  const initials = adminName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "A";

  const profileMenuItems = [
    {
      key: "header",
      label: (
        <div className="min-w-[190px] py-1">
          <p className="truncate text-sm font-bold text-[#101828]">
            {adminName}
          </p>
          <p className="truncate text-xs text-[#64748B]">{adminEmail}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#0755E9]">
            <ShieldCheck size={12} />
            Administrator
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "settings",
      icon: <Settings size={15} />,
      label: "Account Settings",
      onClick: () => router.push("/admin/settings"),
    },
    {
      key: "store",
      icon: <ExternalLink size={15} />,
      label: "View Storefront",
      onClick: () => router.push("/"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut size={15} />,
      label: loggingOut ? "Signing out..." : "Logout",
      danger: true,
      disabled: loggingOut,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-[68px] w-full items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white/95 px-3 backdrop-blur-xs sm:px-6">
      {/* Left: Drawer/Collapse Trigger & Title */}
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <Button
          type="text"
          onClick={onOpenMobileDrawer}
          className="!flex !h-9 !w-9 !items-center !justify-center lg:!hidden"
          aria-label="Open navigation menu"
          icon={<Menu size={20} className="text-[#101828]" />}
        />

        <Button
          type="text"
          onClick={onToggleCollapse}
          className="!hidden !h-9 !w-9 !items-center !justify-center lg:!flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          icon={
            collapsed ? (
              <PanelLeftOpen size={19} className="text-[#64748B]" />
            ) : (
              <PanelLeftClose size={19} className="text-[#64748B]" />
            )
          }
        />

        <div className="min-w-0">
          <h2 className="!m-0 truncate text-sm font-bold text-[#101828] sm:text-base">
            {title}
          </h2>
          <p className="hidden truncate text-[11px] text-[#64748B] sm:block">
            ELENZO Store Administration
          </p>
        </div>
      </div>

      {/* Right: Global Search, Notifications & Profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden md:block">
          <Popover
            content={searchContent}
            trigger="click"
            open={searchOpen}
            onOpenChange={setSearchOpen}
            placement="bottomRight"
          >
            <Input
              allowClear
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search orders, products, pages..."
              className="!w-60 lg:!w-72"
            />
          </Popover>
        </div>

        {/* Mobile Search Trigger */}
        <div className="md:hidden">
          <Popover
            content={
              <div className="space-y-2.5">
                <Input
                  autoFocus
                  allowClear
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  prefix={<Search size={15} className="text-[#94A3B8]" />}
                  placeholder="Search orders, products..."
                />
                {searchContent}
              </div>
            }
            trigger="click"
            open={searchOpen}
            onOpenChange={setSearchOpen}
            placement="bottomRight"
          >
            <Button
              type="text"
              aria-label="Global search"
              className="!flex !h-9 !w-9 !items-center !justify-center"
              icon={<Search size={18} className="text-[#475569]" />}
            />
          </Popover>
        </div>

        {/* Notification Dropdown */}
        <Popover
          content={notificationContent}
          trigger="click"
          open={notifOpen}
          onOpenChange={setNotifOpen}
          placement="bottomRight"
        >
          <Badge count={unreadCount} size="small" offset={[-4, 4]}>
            <Button
              type="text"
              aria-label="Notifications"
              className="!flex !h-9 !w-9 !items-center !justify-center"
              icon={<Bell size={19} className="text-[#475569]" />}
            />
          </Badge>
        </Popover>

        {/* Admin Profile Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1.5 transition hover:border-[#0755E9]/35 hover:bg-[#EFF6FF]/60 sm:px-2.5"
          >
            <Avatar
              size={30}
              className="!bg-[#0755E9] !text-xs !font-bold !text-white"
            >
              {initials}
            </Avatar>
            <Space size={4} className="hidden sm:flex">
              <span className="max-w-[120px] truncate text-xs font-semibold text-[#101828]">
                {adminName}
              </span>
              <ChevronDown size={14} className="text-[#64748B]" />
            </Space>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
