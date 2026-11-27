"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Input,
  Pagination,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from "antd";
import {
  Clock,
  Eye,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";

import useAdminOrders from "@/hooks/useAdminOrders";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import {
  clearQuickOrder,
  selectAdminQuickOrder,
  selectAdminQuickOrderLoading,
} from "@/store/slices/adminSlice";
import { fetchAdminQuickOrder } from "@/store/thunks/adminThunks";

const { RangePicker } = DatePicker;

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

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const quickOrder = useSelector(selectAdminQuickOrder);
  const quickOrderLoading = useSelector(selectAdminQuickOrderLoading);

  const {
    orders,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    refreshOrders,
  } = useAdminOrders();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || !dates[0] || !dates[1]) {
      setFilters((previous) => ({
        ...previous,
        startDate: "",
        endDate: "",
        page: 1,
      }));
      return;
    }

    setFilters((previous) => ({
      ...previous,
      startDate: dates[0].format("YYYY-MM-DD"),
      endDate: dates[1].format("YYYY-MM-DD"),
      page: 1,
    }));
  };

  const openOrderDrawer = (orderId) => {
    setDrawerOpen(true);
    dispatch(fetchAdminQuickOrder(orderId));
  };

  const closeOrderDrawer = () => {
    setDrawerOpen(false);
    dispatch(clearQuickOrder());
  };

  const totalOrders = pagination?.totalOrders ?? 0;
  const pendingCount = orders.filter((o) => o.orderStatus === "Pending").length;
  const processingCount = orders.filter((o) =>
    ["Confirmed", "Processing"].includes(o.orderStatus),
  ).length;
  const deliveredCount = orders.filter(
    (o) => o.orderStatus === "Delivered",
  ).length;

  const columns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      fixed: "left",
      width: 170,
      render: (num, record) => (
        <div>
          <Link
            href={`/admin/orders/${record._id}`}
            className="font-bold text-[#0755E9] hover:underline"
          >
            {num}
          </Link>
          <p className="mt-0.5 text-[11px] text-[#64748B]">
            {record.items?.length || 0} item(s)
          </p>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 210,
      render: (_, record) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#101828]">
            {record.user?.name || "Unknown Customer"}
          </p>
          <p className="truncate text-xs text-[#64748B]">
            {record.user?.email || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (date) => (
        <span className="text-xs text-[#64748B]">{formatDate(date)}</span>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (method) => (
        <Tag color={method === "Online" ? "blue" : "default"}>
          {method === "Online" ? "Online (Razorpay)" : method}
        </Tag>
      ),
    },
    {
      title: "Payment Status",
      key: "paymentStatus",
      width: 155,
      render: (_, record) => (
        <div className="flex flex-col items-start gap-1">
          <Tag color={PAYMENT_STATUS_COLORS[record.paymentStatus] || "default"}>
            {record.paymentStatus}
          </Tag>
          {record.orderStatus === "Cancelled" &&
            record.refundStatus &&
            record.refundStatus !== "NOT_REQUIRED" && (
              <span className="text-[11px] font-semibold text-[#64748B]">
                Refund: {record.refundStatus.replace(/_/g, " ")}
              </span>
            )}
        </div>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 130,
      render: (status) => (
        <Tag color={ORDER_STATUS_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      render: (amt) => (
        <span className="font-bold tabular-nums text-[#101828]">
          {formatPrice(amt)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Eye size={13} />}
            onClick={() => openOrderDrawer(record._id)}
          >
            Preview
          </Button>
          <Link href={`/admin/orders/${record._id}`}>
            <Button size="small" type="primary">
              Manage
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  const hasFilters =
    filters.status !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.startDate ||
    filters.endDate ||
    filters.search ||
    filters.sort !== "newest";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders Management"
        subtitle="Track, filter, preview, verify refunds, and update fulfillment stages."
        badge={`${totalOrders} Total`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={refreshOrders}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Total Filtered"
            value={totalOrders}
            prefix={<ShoppingCart size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Pending (Page)"
            value={pendingCount}
            prefix={<Clock size={16} className="mr-1 text-amber-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Active Fulfillment"
            value={processingCount}
            prefix={<Truck size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Delivered (Page)"
            value={deliveredCount}
            prefix={<Package size={16} className="mr-1 text-emerald-600" />}
          />
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <Input
              allowClear
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search order #, customer, email or SKU..."
            />
          </div>

          <div className="xl:col-span-2">
            <Select
              className="w-full"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              options={[
                { value: "all", label: "All Order Status" },
                { value: "Pending", label: "Pending" },
                { value: "Confirmed", label: "Confirmed" },
                { value: "Processing", label: "Processing" },
                { value: "Shipped", label: "Shipped" },
                { value: "Delivered", label: "Delivered" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </div>

          <div className="xl:col-span-2">
            <Select
              className="w-full"
              value={filters.paymentStatus}
              onChange={(value) => handleFilterChange("paymentStatus", value)}
              options={[
                { value: "all", label: "All Payment Status" },
                { value: "Pending", label: "Pending" },
                { value: "Paid", label: "Paid" },
                { value: "Failed", label: "Failed" },
                { value: "PartiallyRefunded", label: "Partially Refunded" },
                { value: "Refunded", label: "Refunded" },
              ]}
            />
          </div>

          <div className="xl:col-span-2">
            <Select
              className="w-full"
              value={filters.sort}
              onChange={(value) => handleFilterChange("sort", value)}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "amount-high", label: "Amount: High to Low" },
                { value: "amount-low", label: "Amount: Low to High" },
              ]}
            />
          </div>

          <div className="xl:col-span-2">
            <RangePicker
              className="w-full"
              onChange={handleDateRangeChange}
              placeholder={["Start", "End"]}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button
              size="small"
              icon={<X size={14} />}
              onClick={() =>
                setFilters({
                  status: "all",
                  paymentStatus: "all",
                  search: "",
                  startDate: "",
                  endDate: "",
                  sort: "newest",
                  page: 1,
                  limit: filters.limit,
                })
              }
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      {/* Orders Table */}
      <Card
        className="!border-[#E2E8F0]"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={false}
          scroll={{ x: 1080 }}
          locale={{ emptyText: "No orders matched the selected filters" }}
        />

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E8F0] px-5 py-4 sm:flex-row">
          <p className="text-xs text-[#64748B]">
            Showing {orders.length} of {totalOrders} orders
          </p>

          <Pagination
            current={pagination?.currentPage ?? filters.page}
            total={totalOrders}
            pageSize={filters.limit}
            showSizeChanger
            pageSizeOptions={[10, 20, 50]}
            onChange={(page, pageSize) =>
              setFilters((previous) => ({
                ...previous,
                page: pageSize !== previous.limit ? 1 : page,
                limit: pageSize,
              }))
            }
          />
        </div>
      </Card>

      {/* Quick Order Details Drawer */}
      <Drawer
        title={
          quickOrder
            ? `Order #${quickOrder.orderNumber}`
            : "Order Details Preview"
        }
        placement="right"
        open={drawerOpen}
        onClose={closeOrderDrawer}
        loading={quickOrderLoading}
        styles={{ wrapper: { width: "min(560px, 100vw)" } }}
        extra={
          quickOrder && (
            <Link href={`/admin/orders/${quickOrder._id}`}>
              <Button type="primary" size="small">
                Full Management
              </Button>
            </Link>
          )
        }
      >
        {quickOrder && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Tag color={ORDER_STATUS_COLORS[quickOrder.orderStatus]}>
                Order: {quickOrder.orderStatus}
              </Tag>
              <Tag color={PAYMENT_STATUS_COLORS[quickOrder.paymentStatus]}>
                Payment: {quickOrder.paymentStatus}
              </Tag>
              <Tag>{quickOrder.paymentMethod}</Tag>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Customer">
                {quickOrder.user?.name || "Unknown"} (
                {quickOrder.user?.email || "—"})
              </Descriptions.Item>
              <Descriptions.Item label="Placed On">
                {formatDate(quickOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Grand Total">
                <strong className="text-[#0755E9]">
                  {formatPrice(quickOrder.totalAmount)}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address">
                {[
                  quickOrder.shippingAddress?.fullName,
                  quickOrder.shippingAddress?.addressLine1,
                  quickOrder.shippingAddress?.city,
                  quickOrder.shippingAddress?.state,
                  quickOrder.shippingAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Descriptions.Item>
            </Descriptions>

            {quickOrder.orderStatus === "Cancelled" && (
              <Alert
                type="error"
                showIcon
                title={`Cancelled: ${quickOrder.cancellationReason || "Cancelled order"}`}
                description={`Refund status: ${
                  quickOrder.refundSummary?.status ||
                  quickOrder.refundStatus ||
                  "NOT_REQUIRED"
                }`}
              />
            )}

            <Divider titlePlacement="left" className="!my-3 !text-xs">
              Order Items ({quickOrder.items?.length || 0})
            </Divider>

            <div className="space-y-2.5">
              {(quickOrder.items || []).map((item, idx) => (
                <div
                  key={`${item.sku}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#101828]">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Qty {item.quantity} · SKU {item.sku || "N/A"}
                    </p>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-[#101828]">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
