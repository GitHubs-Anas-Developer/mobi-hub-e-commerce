"use client";

import Link from "next/link";
import { Button, Card, Empty, Skeleton, Tag } from "antd";
import { AlertTriangle, ArrowRight, Package } from "lucide-react";

export default function LowStockProducts({ products = [], loading = false }) {
  return (
    <Card
      className="h-full !border-[#E2E8F0]"
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <AlertTriangle size={16} />
          </span>
          <div>
            <h3 className="!m-0 text-base font-bold text-[#101828]">
              Low Stock Alerts
            </h3>
            <p className="mt-0.5 text-xs font-normal text-[#64748B]">
              Active products at or below 5 units
            </p>
          </div>
        </div>
      }
      extra={
        <Link href="/admin/inventory">
          <Button type="link" className="!px-0 !text-xs !font-bold">
            Inventory
            <ArrowRight size={13} className="ml-1 inline" />
          </Button>
        </Link>
      }
      styles={{ body: { padding: loading ? 20 : "8px 20px" } }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : products.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="All active products have healthy inventory levels"
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {products.map((product) => {
            const stock = product.totalStock ?? 0;

            return (
              <div
                key={product._id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                    <Package size={16} />
                  </span>

                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="block truncate text-sm font-semibold text-[#101828] hover:text-[#0755E9]"
                    >
                      {product.name || "Unnamed Product"}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      {product.brand || "ELENZO"}
                    </p>
                  </div>
                </div>

                <Tag color={stock === 0 ? "red" : "orange"} className="!m-0 !font-bold">
                  {stock === 0 ? "Out of stock" : `${stock} left`}
                </Tag>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
