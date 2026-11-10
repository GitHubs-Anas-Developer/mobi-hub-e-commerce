
"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

const formatDateLabel = (value) => {
  if (!value) return "";

  // Supports daily date values and monthly values from the API.
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

export default function SalesChart({ sales = [] }) {
  const chartData = sales.map((item) => ({
    date: item._id,
    totalSales: Number(item.totalSales || 0),
    totalOrders: Number(item.totalOrders || 0),
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          No sales data available for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={25}
          />

          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={75}
          />

          <Tooltip
            formatter={(value, name) => [
              name === "totalSales"
                ? formatCurrency(Number(value))
                : value,
              name === "totalSales" ? "Revenue" : "Orders",
            ]}
            labelFormatter={formatDateLabel}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              fontSize: "13px",
            }}
          />

          <Area
            type="monotone"
            dataKey="totalSales"
            stroke="#1D4ED8"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
