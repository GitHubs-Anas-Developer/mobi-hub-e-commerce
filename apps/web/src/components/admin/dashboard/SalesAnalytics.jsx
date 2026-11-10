
"use client";

import SalesChart from "./SalesChart";

const PERIOD_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "12 Months", value: "12m" },
];

export default function SalesAnalytics({
  sales = [],
  loading = false,
  period,
  setPeriod,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Sales Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sales performance for the selected period.
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex w-fit rounded-lg bg-slate-100 p-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-md px-3 py-2 text-xs font-medium transition sm:text-sm ${
                period === option.value
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        {loading ? (
          <div className="h-[300px] animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <SalesChart sales={sales} />
        )}
      </div>
    </section>
  );
}
