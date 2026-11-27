"use client";

import Link from "next/link";
import { Button, Card, Empty, Skeleton, Tag } from "antd";
import { ArrowRight, Trophy } from "lucide-react";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export default function TopProducts({ products = [], loading = false }) {
  return (
    <Card
      className="h-full !border-[#E2E8F0]"
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
            <Trophy size={16} />
          </span>
          <div>
            <h3 className="!m-0 text-base font-bold text-[#101828]">
              Top Selling Products
            </h3>
            <p className="mt-0.5 text-xs font-normal text-[#64748B]">
              Highest unit volume from paid orders
            </p>
          </div>
        </div>
      }
      extra={
        <Link href="/admin/products">
          <Button type="link" className="!px-0 !text-xs !font-bold">
            Catalog
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
          description="No completed product sales yet"
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {products.map((product, index) => (
            <div
              key={product._id || index}
              className="flex items-center justify-between gap-3 py-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-xs font-extrabold tabular-nums text-[#0755E9]">
                  #{index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#101828]">
                    {product.productName || "Unnamed Product"}
                  </p>
                  <Tag color="blue" className="!mt-1 !text-[11px]">
                    {product.totalSold || 0} sold
                  </Tag>
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold tabular-nums text-[#101828]">
                {formatCurrency(product.totalRevenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
