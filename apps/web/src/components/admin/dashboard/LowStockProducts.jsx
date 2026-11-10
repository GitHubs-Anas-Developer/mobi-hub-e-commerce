
"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Package,
  ArrowRight,
} from "lucide-react";

export default function LowStockProducts({
  products = [],
  loading = false,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-50 p-2.5">
            <AlertTriangle size={19} className="text-orange-600" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Low Stock Products
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Products that need restocking.
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
          <div className="mb-3 rounded-full bg-green-50 p-4">
            <Package size={24} className="text-green-600" />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            All products are in stock
          </p>

          <p className="mt-1 text-sm text-slate-500">
            No low stock products found.
          </p>
        </div>
      ) : (
        /* Products List */
        <div className="divide-y divide-slate-100">
          {products.map((product) => {
            const stock = product.totalStock ?? 0;

            return (
              <div
                key={product._id}
                className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50"
              >
                {/* Product Info */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Package size={19} className="text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {product.name || "Unnamed Product"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {product.brand || "MOBI HUB"}
                    </p>
                  </div>
                </div>

                {/* Stock Status */}
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    stock === 0
                      ? "bg-red-50 text-red-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {stock === 0 ? "Out of stock" : `${stock} left`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
