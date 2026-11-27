"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Pagination,
  Select,
  Statistic,
  Table,
  Tag,
} from "antd";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import adminPaymentService from "@/services/adminPaymentService";

const STATUS_COLORS = {
  Created: "gold",
  Paid: "green",
  Failed: "red",
  RefundPending: "orange",
  PartiallyRefunded: "purple",
  Refunded: "default",
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminPaymentService.getPayments({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        search: filters.search.trim() || undefined,
      });
      setPayments(res.data?.payments || []);
      setPagination(res.data?.pagination || { total: 0, page: 1, limit: 10 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadPayments();
    });
    return () => {
      active = false;
    };
  }, [loadPayments]);

  const paidOnPage = payments.filter((p) => p.status === "Paid").length;
  const refundedOnPage = payments.filter((p) =>
    ["PartiallyRefunded", "Refunded"].includes(p.status),
  ).length;
  const reconCount = payments.filter(
    (p) => p.refundReconciliationRequired,
  ).length;

  const columns = [
    {
      title: "Razorpay Payment ID",
      dataIndex: "razorpayPaymentId",
      key: "razorpayPaymentId",
      width: 195,
      render: (id, r) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#101828]">
            {id || r.razorpayOrderId || "Pending"}
          </span>
          <p className="text-[11px] text-[#64748B]">
            {r.paymentMethod ? r.paymentMethod.toUpperCase() : "Razorpay"}
          </p>
        </div>
      ),
    },
    {
      title: "Order #",
      key: "orderNumber",
      width: 165,
      render: (_, record) =>
        record.order?._id ? (
          <Link
            href={`/admin/orders/${record.order._id}`}
            className="font-bold text-[#0755E9] hover:underline"
          >
            {record.order.orderNumber}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 190,
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
      title: "Captured / Refunded",
      key: "amount",
      width: 150,
      render: (_, r) => (
        <div>
          <p className="font-bold tabular-nums text-[#101828]">
            {formatINR(r.amount)}
          </p>
          {Number(r.refundedAmount || 0) > 0 && (
            <p className="text-[11px] font-semibold text-orange-600">
              Refunded: {formatINR(r.refundedAmount)}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, r) => (
        <div className="flex flex-col items-start gap-1">
          <Tag color={STATUS_COLORS[r.status] || "default"}>{r.status}</Tag>
          {r.refundReconciliationRequired && (
            <Tag color="orange" className="!m-0 !text-[10px]">
              Reconciliation Required
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 165,
      render: (d) => <span className="text-xs text-[#64748B]">{formatDate(d)}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye size={13} />}
          onClick={() => setSelectedPayment(record)}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments Ledger"
        subtitle="Inspect verified Razorpay orders, captures, failure reasons, and reconciliation alerts."
        badge={`${pagination.total || 0} Transactions`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={loadPayments}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Total Gateway Records"
            value={pagination.total || 0}
            prefix={<CreditCard size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Paid (Page)"
            value={paidOnPage}
            prefix={<CheckCircle2 size={16} className="mr-1 text-emerald-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Refunded / Partial (Page)"
            value={refundedOnPage}
            prefix={<Clock size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Reconciliation Flags"
            value={reconCount}
            prefix={<ShieldAlert size={16} className="mr-1 text-orange-600" />}
          />
        </Card>
      </div>

      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              allowClear
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))
              }
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search payment ID, order #, customer email..."
            />
          </div>
          <Select
            value={filters.status}
            onChange={(status) =>
              setFilters((p) => ({ ...p, status, page: 1 }))
            }
            options={[
              { value: "all", label: "All Gateway Status" },
              { value: "Created", label: "Created (Pending)" },
              { value: "Paid", label: "Paid" },
              { value: "Failed", label: "Failed" },
              { value: "RefundPending", label: "Refund Pending" },
              { value: "PartiallyRefunded", label: "Partially Refunded" },
              { value: "Refunded", label: "Refunded" },
            ]}
          />
        </div>
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={payments}
          loading={loading}
          pagination={false}
          scroll={{ x: 980 }}
        />

        <div className="flex justify-end border-t border-[#E2E8F0] px-5 py-4">
          <Pagination
            current={pagination.page || filters.page}
            total={pagination.total || 0}
            pageSize={filters.limit}
            onChange={(page, limit) => setFilters((p) => ({ ...p, page, limit }))}
          />
        </div>
      </Card>

      <Drawer
        title="Payment Inspection"
        open={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        styles={{ wrapper: { width: "min(500px, 100vw)" } }}
        extra={
          selectedPayment?.order?._id && (
            <Link href={`/admin/orders/${selectedPayment.order._id}`}>
              <Button type="primary" size="small">
                Open Order
              </Button>
            </Link>
          )
        }
      >
        {selectedPayment && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Status">
              <Tag color={STATUS_COLORS[selectedPayment.status]}>
                {selectedPayment.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Razorpay Order ID">
              <span className="font-mono text-xs">
                {selectedPayment.razorpayOrderId || "—"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Razorpay Payment ID">
              <span className="font-mono text-xs">
                {selectedPayment.razorpayPaymentId || "—"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Order #">
              {selectedPayment.order?.orderNumber || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              {formatINR(selectedPayment.amount)}
            </Descriptions.Item>
            <Descriptions.Item label="Refunded">
              {formatINR(selectedPayment.refundedAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Reserved Refund">
              {formatINR(selectedPayment.reservedRefundAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Verified At">
              {formatDate(selectedPayment.verifiedAt)}
            </Descriptions.Item>
            {selectedPayment.refundReconciliationReason && (
              <Descriptions.Item label="Reconciliation Note">
                <span className="text-orange-700">
                  {selectedPayment.refundReconciliationReason}
                </span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

