"use client";

import {
  ShoppingCart,
  Users,
  Package,
  IndianRupee,
} from "lucide-react";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function OverviewCards({ overview, loading }) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(overview?.revenue),
      icon: IndianRupee,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Orders",
      value: overview?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Customers",
      value: overview?.totalCustomers ?? 0,
      icon: Users,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Products",
      value: overview?.totalProducts ?? 0,
      icon: Package,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <div className={`rounded-lg p-3 ${card.color}`}>
                <Icon size={21} />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-28 animate-pulse rounded bg-slate-100" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">
                  {card.value}
                </h3>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}