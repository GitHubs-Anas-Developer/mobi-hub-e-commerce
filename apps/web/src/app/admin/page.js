"use client";

import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

import useAdminDashboard from "@/hooks/useAdminDashboard";

import OverviewCards from "@/components/admin/dashboard/OverviewCards";
import SalesAnalytics from "@/components/admin/dashboard/SalesAnalytics";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import LowStockProducts from "@/components/admin/dashboard/LowStockProducts";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("7d");

  const { data, loading, error, refreshDashboard } = useAdminDashboard(period);

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
            className="text-left text-sm font-semibold text-red-700 hover:underline sm:text-right"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <section>
        <OverviewCards overview={data.overview} loading={loading} />
      </section>

      {/* Sales Analytics */}
      <section>
        <SalesAnalytics
          sales={data.sales}
          loading={loading}
          period={period}
          setPeriod={setPeriod}
        />
      </section>

      {/* Recent Orders */}
      <section>
        <RecentOrders orders={data.recentOrders} loading={loading} />
      </section>

      {/* Product Analytics */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopProducts products={data.topProducts} loading={loading} />

        <LowStockProducts products={data.lowStockProducts} loading={loading} />
      </section>
    </div>
  );
}
