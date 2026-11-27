import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  FolderTree,
  Images,
  Layers,
  LayoutDashboard,
  Mail,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Star,
  Store,
  TicketPercent,
  Truck,
  Users,
  Video,
} from "lucide-react";

export const ADMIN_NAV_GROUPS = [
  {
    key: "group-overview",
    label: "Overview",
    items: [
      {
        key: "/admin",
        href: "/admin",
        label: "Dashboard",
        description: "Store KPIs, sales charts, orders & stock alerts",
        icon: LayoutDashboard,
      },
      {
        key: "/admin/analytics",
        href: "/admin/analytics",
        label: "Analytics & Reports",
        description: "Revenue breakdown, payment methods & fulfillment metrics",
        icon: BarChart3,
      },
    ],
  },
  {
    key: "group-sales",
    label: "Sales & Fulfillment",
    items: [
      {
        key: "/admin/orders",
        href: "/admin/orders",
        label: "Orders",
        description: "Manage customer orders, statuses and invoices",
        icon: ShoppingCart,
      },
      {
        key: "/admin/shipping",
        href: "/admin/shipping",
        label: "Shipping & Tracking",
        description: "Dispatch queue, AWB codes and courier updates",
        icon: Truck,
      },
      {
        key: "/admin/payments",
        href: "/admin/payments",
        label: "Payments",
        description: "Razorpay gateway captures, orders & reconciliation",
        icon: CreditCard,
      },
      {
        key: "/admin/refunds",
        href: "/admin/refunds",
        label: "Refunds",
        description: "Order cancellation refunds & customer return queue",
        icon: RotateCcw,
      },
    ],
  },
  {
    key: "group-catalog",
    label: "Catalog & Stock",
    items: [
      {
        key: "/admin/products",
        href: "/admin/products",
        label: "Products",
        description: "Catalog items, pricing, variants and images",
        icon: Package,
      },
      {
        key: "/admin/categories",
        href: "/admin/categories",
        label: "Categories",
        description: "Top-level product departments and hierarchy",
        icon: FolderTree,
      },
      {
        key: "/admin/subcategories",
        href: "/admin/subcategories",
        label: "Subcategories",
        description: "Child categories mapped under parent departments",
        icon: Layers,
      },
      {
        key: "/admin/brands",
        href: "/admin/brands",
        label: "Brands",
        description: "Partner gadget and electronics brands",
        icon: Store,
      },
      {
        key: "/admin/inventory",
        href: "/admin/inventory",
        label: "Inventory",
        description: "Low-stock variants, out-of-stock alerts & stock ledger",
        icon: Boxes,
      },
    ],
  },
  {
    key: "group-marketing",
    label: "Marketing & Content",
    items: [
      {
        key: "/admin/coupons",
        href: "/admin/coupons",
        label: "Coupons",
        description: "Promotional discount codes and usage caps",
        icon: TicketPercent,
      },
      {
        key: "/admin/banners",
        href: "/admin/banners",
        label: "Banners",
        description: "Hero sliders and promotional campaign graphics",
        icon: Images,
      },
      {
        key: "/admin/product-videos",
        href: "/admin/product-videos",
        label: "Product Videos",
        description: "Short shoppable product demos and reels",
        icon: Video,
      },
      {
        key: "/admin/reviews",
        href: "/admin/reviews",
        label: "Reviews",
        description: "Customer ratings and review visibility moderation",
        icon: Star,
      },
      {
        key: "/admin/newsletter",
        href: "/admin/newsletter",
        label: "Newsletter",
        description: "Subscriber growth metrics and email directory",
        icon: Mail,
      },
    ],
  },
  {
    key: "group-system",
    label: "People & System",
    items: [
      {
        key: "/admin/users",
        href: "/admin/users",
        label: "Customers",
        description: "Registered customer accounts and verification status",
        icon: Users,
      },
      {
        key: "/admin/settings",
        href: "/admin/settings",
        label: "Settings",
        description: "Administrator profile, security & store configuration",
        icon: Settings,
      },
    ],
  },
];

export const ALL_ADMIN_NAV_ITEMS = [
  ...ADMIN_NAV_GROUPS.flatMap((group) => group.items),
  {
    key: "/admin/notifications",
    href: "/admin/notifications",
    label: "Notifications",
    description: "Order, inventory, and system alerts",
    icon: Bell,
  },
  {
    key: "/admin/customers",
    href: "/admin/users",
    label: "Customers",
    description: "Customer directory",
    icon: Activity,
  },
];

export const resolveAdminPageMeta = (pathname = "/admin") => {
  const normalized = pathname || "/admin";

  if (normalized === "/admin") {
    return {
      title: "Dashboard Overview",
      subtitle: "Real-time store metrics, revenue trends, and fulfillment alerts",
      activeKey: "/admin",
      breadcrumbs: [{ label: "Dashboard", href: "/admin" }],
    };
  }

  const matchedItem = ALL_ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin")
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) =>
        normalized === item.href || normalized.startsWith(`${item.href}/`),
    );

  const extraSegments = matchedItem
    ? normalized
        .slice(matchedItem.href.length)
        .split("/")
        .filter(Boolean)
    : [];

  const breadcrumbs = [{ label: "Dashboard", href: "/admin" }];

  if (matchedItem) {
    breadcrumbs.push({
      label: matchedItem.label,
      href: extraSegments.length ? matchedItem.href : undefined,
    });
  }

  if (extraSegments.length > 0) {
    const lastSeg = extraSegments[extraSegments.length - 1];
    const formatted =
      lastSeg === "create"
        ? "Create New"
        : lastSeg === "edit"
          ? "Edit Details"
          : extraSegments[0]?.length >= 20
            ? "Details"
            : lastSeg.replace(/[-_]/g, " ");

    breadcrumbs.push({ label: formatted });
  }

  return {
    title: matchedItem?.label || "Admin Panel",
    subtitle:
      matchedItem?.description ||
      "Manage your ELENZO store catalog, orders and operations",
    activeKey: matchedItem?.href || "/admin",
    breadcrumbs,
  };
};

