"use client";

import { useState } from "react";
import { Alert, Button, Card, Empty, Segmented, Statistic, Table, Tag } from "antd";
import { RefreshCw } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import useAdminDashboard from "@/hooks/useAdminDashboard";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import SalesAnalytics from "@/components/admin/dashboard/SalesAnalytics";

const formatINR = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const STATUS_COLORS = [
  "#F59E0B",
  "#0755E9",
  "#4F46E5",
  "#8B5CF6",
  "#16A34A",
  "#DC2626",
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data, loading, error, refreshDashboard } = useAdminDashboard(period);

  const orderPieData = Object.entries(data.orderStats || {})
    .map(([status, count]) => ({ name: status, value: Number(count || 0) }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics & Reports"
        subtitle="Revenue trends, order lifecycle breakdown, payment settlements, and top-performing catalog items."
        badge="Real-Time"
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              value={period}
              onChange={setPeriod}
              options={[
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
                { label: "12 Months", value: "12m" },
              ]}
            />
            <Button
              icon={
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshDashboard}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {error && <Alert type="error" showIcon title={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Paid Revenue"
            value={data.overview?.totalRevenue ?? 0}
            formatter={formatINR}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic title="Total Orders" value={data.overview?.totalOrders ?? 0} />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Total Customers"
            value={data.overview?.totalCustomers ?? 0}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Completed Refunds"
            value={data.overview?.totalRefunds ?? 0}
          />
        </Card>
      </div>

      <SalesAnalytics
        sales={data.sales}
        monthlySales={data.monthlySales}
        loading={loading}
        period={period}
        setPeriod={setPeriod}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card
          className="!border-[#E2E8F0]"
          title="Order Status Breakdown"
        >
          {orderPieData.length === 0 ? (
            <Empty description="No orders recorded yet" />
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {orderPieData.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[idx % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          className="!border-[#E2E8F0]"
          title="Payment Settlement Summary"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey={(r) => `${r.method}-${r.status}`}
            loading={loading}
            pagination={false}
            dataSource={data.paymentStats || []}
            scroll={{ x: 460 }}
            columns={[
              {
                title: "Method",
                dataIndex: "method",
                render: (v) => <Tag color="blue">{v}</Tag>,
              },
              {
                title: "Payment Status",
                dataIndex: "status",
                render: (s) => <Tag>{s}</Tag>,
              },
              {
                title: "Orders",
                dataIndex: "totalOrders",
              },
              {
                title: "Volume",
                dataIndex: "totalAmount",
                render: (amt) => (
                  <span className="font-bold">{formatINR(amt)}</span>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

