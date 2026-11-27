"use client";

import { Empty } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCompactINR = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(amount || 0));

const formatFullINR = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatChartDate = (value) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}$/.test(String(value))) {
    const [year, month] = String(value).split("-");
    const dt = new Date(Number(year), Number(month) - 1, 1);
    return dt.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

export default function SalesChart({ sales = [], variant = "area" }) {
  const chartData = (Array.isArray(sales) ? sales : []).map((item) => ({
    date: item._id,
    totalSales: Number(item.totalSales || 0),
    totalOrders: Number(item.totalOrders || 0),
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No paid order sales recorded for this period"
        />
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {variant === "bar" ? (
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatChartDate}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactINR}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value, name) => [
                name === "totalSales" ? formatFullINR(value) : `${value} orders`,
                name === "totalSales" ? "Revenue" : "Orders",
              ]}
              labelFormatter={formatChartDate}
              contentStyle={{
                borderRadius: "10px",
                borderColor: "#E2E8F0",
                boxShadow: "0 8px 24px rgba(16, 24, 40, 0.08)",
              }}
            />
            <Bar
              dataKey="totalSales"
              fill="#0755E9"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        ) : (
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="elenzoSalesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0755E9" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#0755E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatChartDate}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={22}
            />
            <YAxis
              tickFormatter={formatCompactINR}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value, name) => [
                name === "totalSales" ? formatFullINR(value) : `${value} orders`,
                name === "totalSales" ? "Revenue" : "Orders",
              ]}
              labelFormatter={formatChartDate}
              contentStyle={{
                borderRadius: "10px",
                borderColor: "#E2E8F0",
                boxShadow: "0 8px 24px rgba(16, 24, 40, 0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalSales"
              stroke="#0755E9"
              strokeWidth={2.5}
              fill="url(#elenzoSalesFill)"
              activeDot={{ r: 5, fill: "#082B70", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
