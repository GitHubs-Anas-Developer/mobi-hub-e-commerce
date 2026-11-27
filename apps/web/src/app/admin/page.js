"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button } from "antd";
import { Plus, RefreshCw } from "lucide-react";

import useAdminDashboard from "@/hooks/useAdminDashboard";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import OverviewCards from "@/components/admin/dashboard/OverviewCards";
import SalesAnalytics from "@/components/admin/dashboard/SalesAnalytics";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import LowStockProducts from "@/components/admin/dashboard/LowStockProducts";
import RecentCustomerActivity from "@/components/admin/dashboard/RecentCustomerActivity";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("7d");
  const { data, loading, error, refreshDashboard } = useAdminDashboard(period);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Overview"
        subtitle="Monitor ELENZO store revenue, fulfillment status, refunds, and customer activity."
        badge="Live Metrics"
        extra={
          <>
            <Link href="/admin/products/create">
              <Button icon={<Plus size={15} />} type="primary">
                Add Product
              </Button>
            </Link>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshDashboard}
              disabled={loading}
            >
              Refresh
            </Button>
          </>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          title="Unable to load dashboard metrics"
          description={error}
          action={
            <Button size="small" danger onClick={refreshDashboard}>
              Retry
            </Button>
          }
        />
      )}

      {/* KPI Metrics */}
      <OverviewCards
        overview={data.overview}
        orderStats={data.orderStats}
        loading={loading}
      />

      {/* Revenue Overview & Monthly Sales Charts */}
      <SalesAnalytics
        sales={data.sales}
        monthlySales={data.monthlySales}
        loading={loading}
        period={period}
        setPeriod={setPeriod}
      />

      {/* Recent Orders */}
      <RecentOrders orders={data.recentOrders} loading={loading} />

      {/* Product Performance, Low Stock Alerts & Customer Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <TopProducts products={data.topProducts} loading={loading} />
        <LowStockProducts products={data.lowStockProducts} loading={loading} />
        <div className="lg:col-span-2 xl:col-span-1">
          <RecentCustomerActivity
            customers={data.recentCustomers}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
