"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from "antd";
import {
  CheckCircle2,
  Eye,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import adminPaymentService from "@/services/adminPaymentService";
import adminOrderService from "@/services/adminOrderService";
import adminReturnService from "@/services/adminReturnService";

const REFUND_STATUS_COLORS = {
  Processed: "green",
  Processing: "blue",
  Pending: "gold",
  Failed: "red",
};

const ORDER_REFUND_STATUS_COLORS = {
  SUCCESS: "green",
  PROCESSING: "blue",
  PENDING: "gold",
  FAILED: "red",
  RECONCILIATION_REQUIRED: "orange",
  NOT_REQUIRED: "default",
};

const RETURN_STATUS_COLORS = {
  Requested: "gold",
  Approved: "blue",
  Rejected: "red",
  ProductReceived: "cyan",
  InspectionPassed: "geekblue",
  InspectionFailed: "red",
  RefundProcessing: "purple",
  Refunded: "green",
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

export default function AdminRefundsPage() {
  const { notification } = AntdApp.useApp();

  const [activeTab, setActiveTab] = useState("gateway");

  // Tab 1: Gateway & Cancellation Refunds
  const [refunds, setRefunds] = useState([]);
  const [refundsPagination, setRefundsPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [refundFilters, setRefundFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    provider: "all",
    search: "",
  });
  const [refundsLoading, setRefundsLoading] = useState(true);
  const [refundsError, setRefundsError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Tab 2: Cancelled Orders Awaiting / Failed Refund
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [cancelledLoading, setCancelledLoading] = useState(false);

  // Tab 3: Returns Queue
  const [returnsList, setReturnsList] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);

  // Modals for Retry / Manual Refund
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [manualConfirmed, setManualConfirmed] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);

  const loadGatewayRefunds = useCallback(async () => {
    try {
      setRefundsLoading(true);
      setRefundsError("");

      const response = await adminPaymentService.getRefunds({
        page: refundFilters.page,
        limit: refundFilters.limit,
        status: refundFilters.status,
        provider: refundFilters.provider,
        search: refundFilters.search.trim() || undefined,
      });

      setRefunds(response.data?.refunds || []);
      setRefundsPagination(
        response.data?.pagination || { total: 0, page: 1, limit: 10 },
      );
    } catch (err) {
      setRefundsError(
        err.response?.data?.message || "Failed to load refund records.",
      );
    } finally {
      setRefundsLoading(false);
    }
  }, [refundFilters]);

  const loadCancelledOrdersQueue = useCallback(async () => {
    try {
      setCancelledLoading(true);
      const response = await adminOrderService.getOrders({
        status: "Cancelled",
        limit: 50,
        sort: "newest",
      });
      setCancelledOrders(response.data?.orders || []);
    } catch (err) {
      console.error("Failed loading cancelled orders queue:", err);
    } finally {
      setCancelledLoading(false);
    }
  }, []);

  const loadReturnsQueue = useCallback(async () => {
    try {
      setReturnsLoading(true);
      const response = await adminReturnService.getReturns({ limit: 50 });
      setReturnsList(
        response.data?.returns || response.data?.data || response.data || [],
      );
    } catch (err) {
      console.error("Failed loading returns queue:", err);
    } finally {
      setReturnsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadGatewayRefunds();
    });
    return () => {
      active = false;
    };
  }, [loadGatewayRefunds]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      if (activeTab === "pending") {
        loadCancelledOrdersQueue();
      } else if (activeTab === "returns") {
        loadReturnsQueue();
      }
    });
    return () => {
      active = false;
    };
  }, [activeTab, loadCancelledOrdersQueue, loadReturnsQueue]);

  const handleSyncRefund = async (orderId) => {
    if (!orderId || busyId) return;
    try {
      setBusyId(orderId);
      const res = await adminPaymentService.syncRefund(orderId);
      notification.success({
        message: "Refund Synchronized",
        description: res.message || "Refund status synced with Razorpay.",
      });
      await Promise.all([loadGatewayRefunds(), loadCancelledOrdersQueue()]);
    } catch (err) {
      notification.error({
        message: "Sync Failed",
        description:
          err.response?.data?.message ||
          "Unable to verify refund status with Razorpay.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const openProcessModal = (orderObj, defaultAmt = null) => {
    setRefundModalOrder(orderObj);
    setRefundAmount(
      defaultAmt ?? Number(orderObj?.refundAmount || orderObj?.totalAmount || 0),
    );
    setRefundReason(
      orderObj?.cancellationReason || "Admin processed cancellation refund",
    );
    setManualConfirmed(false);
  };

  const handleModalRefundSubmit = async () => {
    if (!refundModalOrder?._id || submittingModal) return;
    const isCOD = refundModalOrder.paymentMethod === "COD";

    try {
      setSubmittingModal(true);
      const res = await adminPaymentService.processRefund({
        orderId: refundModalOrder._id,
        amount: refundAmount || undefined,
        reason: refundReason.trim() || undefined,
        provider: isCOD ? "Manual" : "Razorpay",
        manualRefundConfirmed: isCOD ? manualConfirmed : undefined,
      });

      notification.success({
        message: "Refund Updated",
        description: res.message || "Refund request submitted.",
      });
      setRefundModalOrder(null);
      await Promise.all([loadGatewayRefunds(), loadCancelledOrdersQueue()]);
    } catch (err) {
      notification.error({
        message: "Refund Failed",
        description:
          err.response?.data?.message || "Unable to process refund.",
      });
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleReturnAction = async (ret, action) => {
    if (!ret?._id || busyId) return;
    try {
      setBusyId(ret._id);
      if (action === "approve") {
        await adminReturnService.reviewReturn(ret._id, { decision: "Approved" });
      } else if (action === "reject") {
        await adminReturnService.reviewReturn(ret._id, {
          decision: "Rejected",
          adminNote: "Rejected via refunds queue",
        });
      } else if (action === "received") {
        await adminReturnService.markReceived(ret._id);
      } else if (action === "inspect_pass") {
        await adminReturnService.inspectReturn(ret._id, {
          inspectionStatus: "Passed",
        });
      } else if (action === "restore_stock") {
        await adminReturnService.restoreStock(ret._id);
      } else if (action === "refund") {
        await adminReturnService.processReturnRefund(ret._id, {
          manualRefundConfirmed: ret.refundMethod === "Manual",
        });
      }
      notification.success({
        message: "Return Updated",
        description: `Action "${action.replace(/_/g, " ")}" completed.`,
      });
      await loadReturnsQueue();
    } catch (err) {
      notification.error({
        message: "Return Action Failed",
        description:
          err.response?.data?.message || "Unable to perform return action.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const refundColumns = [
    {
      title: "Order Number",
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
      title: "Payment Method",
      key: "method",
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.provider === "Razorpay" ? "blue" : "default"}>
            {record.provider}
          </Tag>
          <span className="text-[11px] text-[#64748B]">
            {record.referenceType} #{record.attempt}
          </span>
        </Space>
      ),
    },
    {
      title: "Refund Amount",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (amt) => (
        <span className="font-bold tabular-nums text-[#101828]">
          {formatINR(amt)}
        </span>
      ),
    },
    {
      title: "Refund Status",
      key: "status",
      width: 145,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={REFUND_STATUS_COLORS[record.status] || "default"}>
            {record.status}
          </Tag>
          {record.uncertainState && (
            <Tag color="orange" className="!m-0 !text-[10px]">
              Uncertain / Sync Needed
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Gateway Reference",
      dataIndex: "providerRefundId",
      key: "providerRefundId",
      width: 175,
      render: (id) =>
        id ? (
          <span className="font-mono text-xs text-[#101828]">{id}</span>
        ) : (
          <span className="text-xs text-[#94A3B8]">Pending assignment</span>
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
      width: 210,
      render: (_, record) => {
        const orderId = record.order?._id;
        const canSync =
          record.provider === "Razorpay" &&
          record.referenceType === "OrderCancellation" &&
          orderId &&
          (["Pending", "Processing"].includes(record.status) ||
            record.uncertainState ||
            record.payment?.refundReconciliationRequired);

        const canRetry =
          record.referenceType === "OrderCancellation" &&
          record.status === "Failed" &&
          !record.uncertainState &&
          record.order?.paymentStatus !== "Refunded" &&
          orderId;

        return (
          <Space size="small" wrap>
            {canSync && (
              <Button
                size="small"
                loading={busyId === orderId}
                onClick={() => handleSyncRefund(orderId)}
              >
                Sync
              </Button>
            )}
            {canRetry && (
              <Button
                size="small"
                type="primary"
                onClick={() => openProcessModal(record.order, record.amount)}
              >
                Retry
              </Button>
            )}
            {orderId && (
              <Link href={`/admin/orders/${orderId}`}>
                <Button size="small" icon={<Eye size={13} />}>
                  Order
                </Button>
              </Link>
            )}
          </Space>
        );
      },
    },
  ];

  const actionableCancelledOrders = cancelledOrders.filter(
    (o) =>
      o.paymentStatus === "Paid" ||
      ["PENDING", "PROCESSING", "FAILED", "RECONCILIATION_REQUIRED"].includes(
        o.refundStatus,
      ),
  );

  const cancelledQueueColumns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (num, record) => (
        <Link
          href={`/admin/orders/${record._id}`}
          className="font-bold text-[#0755E9] hover:underline"
        >
          {num}
        </Link>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, r) => r.user?.name || r.user?.email || "—",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (m, r) => (
        <Tag color={m === "Online" ? "blue" : "default"}>
          {m} · {r.paymentStatus}
        </Tag>
      ),
    },
    {
      title: "Refund Amount",
      key: "amount",
      render: (_, r) => (
        <span className="font-bold tabular-nums">
          {formatINR(r.refundAmount || r.totalAmount)}
        </span>
      ),
    },
    {
      title: "Refund Status",
      dataIndex: "refundStatus",
      key: "refundStatus",
      render: (status) => (
        <Tag color={ORDER_REFUND_STATUS_COLORS[status] || "default"}>
          {status || "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Cancelled On",
      dataIndex: "cancelledAt",
      key: "cancelledAt",
      render: (d) => <span className="text-xs text-[#64748B]">{formatDate(d)}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          {record.paymentMethod === "Online" &&
            ["PENDING", "PROCESSING", "RECONCILIATION_REQUIRED"].includes(
              record.refundStatus,
            ) && (
              <Button
                size="small"
                loading={busyId === record._id}
                onClick={() => handleSyncRefund(record._id)}
              >
                Sync
              </Button>
            )}
          {record.paymentStatus === "Paid" &&
            !["PROCESSING", "RECONCILIATION_REQUIRED"].includes(
              record.refundStatus,
            ) && (
              <Button
                size="small"
                type="primary"
                onClick={() => openProcessModal(record, record.totalAmount)}
              >
                {record.paymentMethod === "COD"
                  ? "Manual COD Refund"
                  : "Process Refund"}
              </Button>
            )}
          <Link href={`/admin/orders/${record._id}`}>
            <Button size="small">View Order</Button>
          </Link>
        </Space>
      ),
    },
  ];

  const returnColumns = [
    {
      title: "Return #",
      dataIndex: "returnNumber",
      key: "returnNumber",
      render: (val) => <span className="font-bold text-[#101828]">{val}</span>,
    },
    {
      title: "Order #",
      key: "order",
      render: (_, r) =>
        r.order?._id ? (
          <Link
            href={`/admin/orders/${r.order._id}`}
            className="font-semibold text-[#0755E9] hover:underline"
          >
            {r.order.orderNumber || r.order._id}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      title: "Refund Amount",
      dataIndex: "refundAmount",
      key: "refundAmount",
      render: (amt, r) => (
        <div>
          <span className="font-bold">{formatINR(amt)}</span>
          <p className="text-[11px] text-[#64748B]">{r.refundMethod}</p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={RETURN_STATUS_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => <span className="text-xs text-[#64748B]">{formatDate(d)}</span>,
    },
    {
      title: "Backend Actions",
      key: "actions",
      render: (_, ret) => (
        <Space size="small" wrap>
          {ret.status === "Requested" && (
            <>
              <Button
                size="small"
                type="primary"
                loading={busyId === ret._id}
                onClick={() => handleReturnAction(ret, "approve")}
              >
                Approve
              </Button>
              <Button
                size="small"
                danger
                loading={busyId === ret._id}
                onClick={() => handleReturnAction(ret, "reject")}
              >
                Reject
              </Button>
            </>
          )}
          {ret.status === "Approved" && (
            <Button
              size="small"
              loading={busyId === ret._id}
              onClick={() => handleReturnAction(ret, "received")}
            >
              Mark Received
            </Button>
          )}
          {ret.status === "ProductReceived" && (
            <Button
              size="small"
              type="primary"
              loading={busyId === ret._id}
              onClick={() => handleReturnAction(ret, "inspect_pass")}
            >
              Pass Inspection
            </Button>
          )}
          {ret.status === "InspectionPassed" && !ret.stockRestoredAt && (
            <Button
              size="small"
              loading={busyId === ret._id}
              onClick={() => handleReturnAction(ret, "restore_stock")}
            >
              Restore Stock
            </Button>
          )}
          {ret.status === "InspectionPassed" && ret.stockRestoredAt && (
            <Button
              size="small"
              type="primary"
              loading={busyId === ret._id}
              onClick={() => handleReturnAction(ret, "refund")}
            >
              Process Refund
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const processedCount = refunds.filter((r) => r.status === "Processed").length;
  const pendingOrProcessingCount = refunds.filter((r) =>
    ["Pending", "Processing"].includes(r.status),
  ).length;
  const failedCount = refunds.filter((r) => r.status === "Failed").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Refund Management"
        subtitle="Audit gateway refund transactions, reconcile timed-out requests, and settle approved returns."
        badge={`${refundsPagination.total || 0} Records`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={refundsLoading ? "animate-spin" : ""}
              />
            }
            onClick={() => {
              loadGatewayRefunds();
              if (activeTab === "pending") loadCancelledOrdersQueue();
              if (activeTab === "returns") loadReturnsQueue();
            }}
          >
            Refresh
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Total Refunds Log"
            value={refundsPagination.total || 0}
            prefix={<RotateCcw size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="In Progress (Page)"
            value={pendingOrProcessingCount}
            prefix={<RefreshCw size={16} className="mr-1 text-amber-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Completed (Page)"
            value={processedCount}
            prefix={<CheckCircle2 size={16} className="mr-1 text-emerald-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Failed / Retry (Page)"
            value={failedCount}
            prefix={<ShieldAlert size={16} className="mr-1 text-red-600" />}
          />
        </Card>
      </div>

      {refundsError && <Alert type="error" showIcon title={refundsError} />}

      <Card className="!border-[#E2E8F0]">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "gateway",
              label: "Gateway Refund Transactions",
              children: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <Input
                        allowClear
                        value={refundFilters.search}
                        onChange={(e) =>
                          setRefundFilters((p) => ({
                            ...p,
                            search: e.target.value,
                            page: 1,
                          }))
                        }
                        prefix={<Search size={15} className="text-[#94A3B8]" />}
                        placeholder="Search order #, Razorpay rfnd_..., customer..."
                      />
                    </div>
                    <Select
                      value={refundFilters.status}
                      onChange={(val) =>
                        setRefundFilters((p) => ({
                          ...p,
                          status: val,
                          page: 1,
                        }))
                      }
                      options={[
                        { value: "all", label: "All Refund Status" },
                        { value: "Pending", label: "Pending" },
                        { value: "Processing", label: "Processing" },
                        { value: "Processed", label: "Processed" },
                        { value: "Failed", label: "Failed" },
                      ]}
                    />
                    <Select
                      value={refundFilters.provider}
                      onChange={(val) =>
                        setRefundFilters((p) => ({
                          ...p,
                          provider: val,
                          page: 1,
                        }))
                      }
                      options={[
                        { value: "all", label: "All Providers" },
                        { value: "Razorpay", label: "Razorpay" },
                        { value: "Manual", label: "Manual COD" },
                      ]}
                    />
                  </div>

                  <Table
                    rowKey="_id"
                    columns={refundColumns}
                    dataSource={refunds}
                    loading={refundsLoading}
                    pagination={false}
                    scroll={{ x: 1080 }}
                    locale={{ emptyText: "No refund transactions recorded yet" }}
                  />

                  <div className="flex justify-end pt-2">
                    <Pagination
                      current={refundsPagination.page || refundFilters.page}
                      total={refundsPagination.total || 0}
                      pageSize={refundFilters.limit}
                      onChange={(page, limit) =>
                        setRefundFilters((p) => ({ ...p, page, limit }))
                      }
                    />
                  </div>
                </div>
              ),
            },
            {
              key: "pending",
              label: `Cancelled Orders Queue (${actionableCancelledOrders.length})`,
              children: (
                <Table
                  rowKey="_id"
                  columns={cancelledQueueColumns}
                  dataSource={actionableCancelledOrders}
                  loading={cancelledLoading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 900 }}
                  locale={{
                    emptyText: "No cancelled orders awaiting refund action",
                  }}
                />
              ),
            },
            {
              key: "returns",
              label: `Product Returns (${returnsList.length})`,
              children: (
                <Table
                  rowKey="_id"
                  columns={returnColumns}
                  dataSource={returnsList}
                  loading={returnsLoading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 900 }}
                  locale={{ emptyText: "No customer return requests found" }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Process / Retry Cancellation Refund Modal */}
      <Modal
        open={Boolean(refundModalOrder)}
        title={
          refundModalOrder
            ? `Process Refund · ${refundModalOrder.orderNumber}`
            : "Process Refund"
        }
        onCancel={() => !submittingModal && setRefundModalOrder(null)}
        onOk={handleModalRefundSubmit}
        okText={
          refundModalOrder?.paymentMethod === "COD"
            ? "Confirm Manual COD Refund"
            : "Execute Razorpay Refund"
        }
        confirmLoading={submittingModal}
        okButtonProps={{
          disabled:
            refundModalOrder?.paymentMethod === "COD" && !manualConfirmed,
        }}
      >
        {refundModalOrder && (
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Refund Amount (INR)
              </label>
              <InputNumber
                className="!w-full"
                min={0.01}
                value={refundAmount}
                onChange={setRefundAmount}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Reason
              </label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund"
              />
            </div>

            {refundModalOrder.paymentMethod === "COD" && (
              <Checkbox
                checked={manualConfirmed}
                onChange={(e) => setManualConfirmed(e.target.checked)}
              >
                <span className="text-xs text-[#101828]">
                  I confirm that the manual COD refund has actually been
                  transferred.
                </span>
              </Checkbox>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

