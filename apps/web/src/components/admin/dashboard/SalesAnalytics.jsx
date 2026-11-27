"use client";

import { Card, Segmented, Skeleton } from "antd";
import SalesChart from "./SalesChart";

const PERIOD_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "12 Months", value: "12m" },
];

export default function SalesAnalytics({
  sales = [],
  monthlySales = [],
  loading = false,
  period,
  setPeriod,
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Revenue Overview */}
      <Card
        className="xl:col-span-7 !border-[#E2E8F0]"
        title={
          <div>
            <h3 className="!m-0 text-base font-bold text-[#101828]">
              Revenue Overview
            </h3>
            <p className="mt-0.5 text-xs font-normal text-[#64748B]">
              Paid order revenue across the selected time window
            </p>
          </div>
        }
        extra={
          <Segmented
            size="small"
            value={period}
            onChange={(value) => setPeriod(value)}
            options={PERIOD_OPTIONS}
          />
        }
      >
        {loading ? (
          <div className="py-10">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <SalesChart sales={sales} variant="area" />
        )}
      </Card>

      {/* Monthly Sales Chart */}
      <Card
        className="xl:col-span-5 !border-[#E2E8F0]"
        title={
          <div>
            <h3 className="!m-0 text-base font-bold text-[#101828]">
              Monthly Sales
            </h3>
            <p className="mt-0.5 text-xs font-normal text-[#64748B]">
              Last 12 months revenue performance
            </p>
          </div>
        }
      >
        {loading ? (
          <div className="py-10">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <SalesChart sales={monthlySales} variant="bar" />
        )}
      </Card>
    </div>
  );
}
