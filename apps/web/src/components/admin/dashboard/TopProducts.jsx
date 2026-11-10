
"use client";

import Link from "next/link";
import { Package, ArrowRight, Trophy } from "lucide-react";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TopProducts({
  products = [],
  loading = false,
}) {

    console.log("products",products)
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5">
            <Trophy size={19} className="text-blue-600" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Top Products
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Best-selling products.
            </p>
          </div>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4 p-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-3 rounded-full bg-slate-100 p-4">
            <Package size={24} className="text-slate-400" />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            No product sales yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Best-selling products will appear here.
          </p>
        </div>
      ) : (
        /* Products List */
        <div className="divide-y divide-slate-100">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50"
            >
              {/* Product Info */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {product.productName || "Unnamed Product"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {product.totalSold || 0} units sold
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(product.totalRevenue)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Revenue
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
