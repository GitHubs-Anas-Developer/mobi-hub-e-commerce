"use client";

import Link from "next/link";
import { Card, Skeleton, Statistic } from "antd";
import {
  Ban,
  Clock,
  IndianRupee,
  Loader,
  Package,
  RotateCcw,
  ShoppingCart,
  Users,
} from "lucide-react";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export default function OverviewCards({ overview, orderStats = {}, loading }) {
  const cards = [
    {
      title: "Total Revenue",
      value: overview?.totalRevenue ?? 0,
      formatter: (val) => formatCurrency(val),
      subtitle: "Net paid non-cancelled",
      href: "/admin/analytics",
      icon: IndianRupee,
      accentBg: "bg-[#EFF6FF]",
      accentText: "text-[#0755E9]",
    },
    {
      title: "Total Orders",
      value: overview?.totalOrders ?? 0,
      subtitle: "All-time customer orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      accentBg: "bg-indigo-50",
      accentText: "text-indigo-600",
    },
    {
      title: "Total Customers",
      value: overview?.totalCustomers ?? 0,
      subtitle: "Registered accounts",
      href: "/admin/users",
      icon: Users,
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-600",
    },
    {
      title: "Total Products",
      value: overview?.totalProducts ?? 0,
      subtitle: `${overview?.activeProducts ?? 0} active · ${overview?.lowStockProducts ?? 0} low stock`,
      href: "/admin/products",
      icon: Package,
      accentBg: "bg-sky-50",
      accentText: "text-sky-600",
    },
    {
      title: "Pending Orders",
      value: orderStats?.Pending ?? 0,
      subtitle: "Awaiting confirmation",
      href: "/admin/orders?status=Pending",
      icon: Clock,
      accentBg: "bg-amber-50",
      accentText: "text-amber-600",
    },
    {
      title: "Processing Orders",
      value: orderStats?.Processing ?? 0,
      subtitle: "Preparing for dispatch",
      href: "/admin/orders?status=Processing",
      icon: Loader,
      accentBg: "bg-blue-50",
      accentText: "text-[#0755E9]",
    },
    {
      title: "Cancelled Orders",
      value: orderStats?.Cancelled ?? 0,
      subtitle: "Cancelled by user or admin",
      href: "/admin/orders?status=Cancelled",
      icon: Ban,
      accentBg: "bg-rose-50",
      accentText: "text-rose-600",
    },
    {
      title: "Pending Refunds",
      value: overview?.pendingRefunds ?? 0,
      subtitle: "Requires settlement or sync",
      href: "/admin/refunds",
      icon: RotateCcw,
      accentBg: "bg-orange-50",
      accentText: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link key={card.title} href={card.href} className="block group">
            <Card
              className="h-full !border-[#E2E8F0] transition-all group-hover:!border-[#0755E9]/40 group-hover:shadow-sm"
              styles={{ body: { padding: "18px 20px" } }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 1 }} title={{ width: "60%" }} />
                  ) : (
                    <>
                      <Statistic
                        title={
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                            {card.title}
                          </span>
                        }
                        value={card.value}
                        formatter={card.formatter}
                        styles={{
                          content: {
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#101828",
                            lineHeight: 1.3,
                          },
                        }}
                      />
                      <p className="mt-1.5 truncate text-xs text-[#64748B]">
                        {card.subtitle}
                      </p>
                    </>
                  )}
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accentBg} ${card.accentText}`}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
