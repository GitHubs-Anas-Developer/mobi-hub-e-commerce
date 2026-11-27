"use client";

import Link from "next/link";
import { Button, Card, Table, Tag } from "antd";
import { ArrowRight } from "lucide-react";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ORDER_STATUS_COLORS = {
  Pending: "gold",
  Confirmed: "blue",
  Processing: "geekblue",
  Shipped: "purple",
  Delivered: "green",
  Cancelled: "red",
};

const PAYMENT_STATUS_COLORS = {
  Pending: "gold",
  Paid: "green",
  Failed: "red",
  PartiallyRefunded: "orange",
  Refunded: "default",
};

export default function RecentOrders({ orders = [], loading = false }) {
  const columns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (val, record) => (
        <Link
          href={`/admin/orders/${record._id}`}
          className="font-bold text-[#0755E9] hover:text-[#082B70] hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#101828]">
            {record.user?.name || "Customer"}
          </p>
          <p className="truncate text-xs text-[#64748B]">
            {record.user?.email || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amt) => (
        <span className="font-bold tabular-nums text-[#101828]">
          {formatCurrency(amt)}
        </span>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      render: (_, record) => (
        <div className="flex flex-col items-start gap-1">
          <Tag color={PAYMENT_STATUS_COLORS[record.paymentStatus] || "default"}>
            {record.paymentStatus || "Pending"}
          </Tag>
          <span className="text-[11px] text-[#64748B]">
            {record.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag color={ORDER_STATUS_COLORS[status] || "default"}>
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-xs text-[#64748B]">{formatDate(date)}</span>
      ),
    },
  ];

  return (
    <Card
      className="!border-[#E2E8F0]"
      title={
        <div>
          <h3 className="!m-0 text-base font-bold text-[#101828]">
            Recent Orders
          </h3>
          <p className="mt-0.5 text-xs font-normal text-[#64748B]">
            Latest incoming customer orders across ELENZO
          </p>
        </div>
      }
      extra={
        <Link href="/admin/orders">
          <Button type="link" className="!px-0 !text-xs !font-bold">
            View All Orders
            <ArrowRight size={14} className="ml-1 inline" />
          </Button>
        </Link>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={false}
        scroll={{ x: 740 }}
        locale={{ emptyText: "No recent orders recorded yet" }}
      />
    </Card>
  );
}
