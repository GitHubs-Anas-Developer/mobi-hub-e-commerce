"use client";

import Link from "next/link";
import { Avatar, Badge, Button, Card, Empty, Skeleton, Tag } from "antd";
import { ArrowRight, Users } from "lucide-react";

const formatRelativeDate = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RecentCustomerActivity({
  customers = [],
  loading = false,
}) {
  return (
    <Card
      className="h-full !border-[#E2E8F0]"
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Users size={16} />
          </span>
          <div>
            <h3 className="!m-0 text-base font-bold text-[#101828]">
              Recent Customer Activity
            </h3>
            <p className="mt-0.5 text-xs font-normal text-[#64748B]">
              Latest customer sign-ins and newly registered accounts
            </p>
          </div>
        </div>
      }
      extra={
        <Link href="/admin/users">
          <Button type="link" className="!px-0 !text-xs !font-bold">
            Customers
            <ArrowRight size={13} className="ml-1 inline" />
          </Button>
        </Link>
      }
      styles={{ body: { padding: loading ? 20 : "8px 20px" } }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : customers.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No recent customer activity"
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {customers.map((customer) => {
            const initials =
              String(customer.name || "C")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0].toUpperCase())
                .join("") || "C";

            return (
              <div
                key={customer._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    size={36}
                    className="!shrink-0 !bg-[#EFF6FF] !text-xs !font-bold !text-[#0755E9]"
                  >
                    {initials}
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#101828]">
                        {customer.name || "Customer"}
                      </p>
                      <Badge
                        status={customer.isActive ? "success" : "error"}
                      />
                    </div>
                    <p className="truncate text-xs text-[#64748B]">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <Tag
                    color={customer.isEmailVerified ? "green" : "amber"}
                    className="!m-0 !text-[11px]"
                  >
                    {customer.isEmailVerified ? "Verified" : "Unverified"}
                  </Tag>
                  <span className="text-[11px] text-[#94A3B8]">
                    {customer.lastLoginAt
                      ? `Active ${formatRelativeDate(customer.lastLoginAt)}`
                      : `Joined ${formatRelativeDate(customer.createdAt)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

