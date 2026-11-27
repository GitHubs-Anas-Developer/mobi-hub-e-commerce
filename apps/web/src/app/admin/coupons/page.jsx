"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  TicketPercent,
  Trash2,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import useAdminCoupons from "@/hooks/useAdminCoupons";
import adminCouponService from "@/services/adminCouponService";

const getCouponStatus = (coupon) => {
  const now = new Date();
  const expiry = new Date(coupon.expiryDate);
  const start = new Date(coupon.startDate);

  if (!coupon.isActive) return "Inactive";
  if (now > expiry) return "Expired";
  if (now < start) return "Scheduled";
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return "Limit Reached";
  }

  return "Active";
};

const statusColors = {
  Active: "success",
  Inactive: "default",
  Scheduled: "processing",
  Expired: "error",
  "Limit Reached": "warning",
};

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminCouponsPage() {
  const { message } = App.useApp();

  const {
    coupons,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingCouponId,
    refreshCoupons,
    updateCouponStatus,
  } = useAdminCoupons();

  const [deletingCouponId, setDeletingCouponId] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
      page: 1,
    }));
  };

  const handleToggleStatus = async (coupon) => {
    try {
      setActionError("");
      const nextStatus = !coupon.isActive;
      await updateCouponStatus(coupon._id, nextStatus);
      message.success(
        `Coupon ${coupon.code} ${nextStatus ? "activated" : "deactivated"} successfully.`,
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update coupon status.",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      setActionError("");
      setDeletingCouponId(couponToDelete._id);
      await adminCouponService.deleteCoupon(couponToDelete._id);
      message.success(`Coupon ${couponToDelete.code} deleted successfully.`);
      setCouponToDelete(null);
      await refreshCoupons();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete coupon.");
    } finally {
      setDeletingCouponId(null);
    }
  };

  const totalCount = pagination?.totalCoupons ?? coupons.length;
  const activeCount = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Active",
  ).length;
  const inactiveCount = coupons.filter((coupon) => !coupon.isActive).length;
  const expiredCount = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Expired",
  ).length;

  const columns = [
    {
      title: "Coupon Code",
      key: "code",
      width: 220,
      render: (_, coupon) => (
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-[#101828]">
            {coupon.code}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#64748B]">
            {coupon.description || "No description provided"}
          </p>
        </div>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      width: 140,
      render: (_, coupon) => (
        <div>
          <span className="font-semibold text-[#101828]">
            {coupon.discountType === "Percentage"
              ? `${coupon.discountValue}% OFF`
              : `₹${coupon.discountValue} OFF`}
          </span>
          {coupon.maxDiscountAmount !== null &&
            coupon.maxDiscountAmount !== undefined && (
              <p className="mt-0.5 text-xs text-[#64748B]">
                Up to ₹{coupon.maxDiscountAmount}
              </p>
            )}
        </div>
      ),
    },
    {
      title: "Min. Order",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      width: 120,
      render: (val) => (
        <span className="font-medium text-[#334155]">₹{val ?? 0}</span>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      width: 140,
      render: (_, coupon) => (
        <div>
          <p className="text-sm font-semibold text-[#101828]">
            {coupon.usedCount ?? 0} / {coupon.usageLimit ?? "∞"}
          </p>
          <p className="text-xs text-[#64748B]">
            Per user: {coupon.perUserLimit ?? 1}
          </p>
        </div>
      ),
    },
    {
      title: "Validity",
      key: "validity",
      width: 170,
      render: (_, coupon) => (
        <div className="text-xs text-[#475569]">
          <p className="font-medium text-[#101828]">
            {formatDate(coupon.startDate)}
          </p>
          <p className="mt-0.5 text-[#64748B]">
            to {formatDate(coupon.expiryDate)}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 165,
      render: (_, coupon) => {
        const computedStatus = getCouponStatus(coupon);
        const isUpdating = updatingCouponId === coupon._id;

        return (
          <div className="flex items-center gap-2.5">
            <Switch
              size="small"
              checked={Boolean(coupon.isActive)}
              loading={isUpdating}
              disabled={Boolean(deletingCouponId)}
              onChange={() => handleToggleStatus(coupon)}
              aria-label={`Toggle ${coupon.code}`}
            />
            <Tag color={statusColors[computedStatus] || "default"}>
              {computedStatus}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      align: "right",
      render: (_, coupon) => {
        const isBusy =
          updatingCouponId === coupon._id || deletingCouponId === coupon._id;

        return (
          <div className="flex items-center justify-end gap-2">
            <Tooltip title="Edit coupon">
              <Link href={`/admin/coupons/${coupon._id}/edit`}>
                <Button
                  size="small"
                  icon={<Pencil size={14} />}
                  disabled={isBusy}
                />
              </Link>
            </Tooltip>

            <Tooltip title="Delete coupon">
              <Button
                size="small"
                danger
                icon={<Trash2 size={14} />}
                loading={deletingCouponId === coupon._id}
                disabled={isBusy}
                onClick={() => setCouponToDelete(coupon)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Discount Coupons"
        subtitle="Manage promotional promo codes, discount rules, usage caps, and expiration windows."
        badge={`${totalCount} Total`}
        extra={
          <>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshCoupons}
              disabled={loading}
            >
              Refresh
            </Button>

            <Link href="/admin/coupons/create">
              <Button type="primary" icon={<Plus size={16} />}>
                Create Coupon
              </Button>
            </Link>
          </>
        }
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Total Coupons"
            value={totalCount}
            prefix={<TicketPercent size={18} className="text-[#0755E9]" />}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Active (On Page)"
            value={activeCount}
            prefix={<CheckCircle2 size={18} className="text-emerald-600" />}
            styles={{ content: { color: "#059669" } }}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Inactive (On Page)"
            value={inactiveCount}
            prefix={<Power size={18} className="text-[#64748B]" />}
            styles={{ content: { color: "#475569" } }}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Expired (On Page)"
            value={expiredCount}
            prefix={<CalendarDays size={18} className="text-red-600" />}
            styles={{ content: { color: "#dc2626" } }}
          />
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-[#E2E8F0] shadow-xs">
        <div className="space-y-4">
          <Input
            size="large"
            allowClear
            prefix={<Search size={16} className="text-[#64748B]" />}
            value={filters.search}
            onChange={(event) => handleFilterChange("search", event.target.value)}
            placeholder="Search by coupon code or description..."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              value={filters.status}
              onChange={(val) => handleFilterChange("status", val)}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />

            <Select
              value={filters.expiryStatus}
              onChange={(val) => handleFilterChange("expiryStatus", val)}
              options={[
                { label: "All Validity", value: "all" },
                { label: "Currently Valid", value: "active" },
                { label: "Expired", value: "expired" },
                { label: "Scheduled", value: "scheduled" },
              ]}
            />

            <Select
              value={filters.sortBy}
              onChange={(val) => handleFilterChange("sortBy", val)}
              options={[
                { label: "Sort: Created Date", value: "createdAt" },
                { label: "Sort: Coupon Code", value: "code" },
                { label: "Sort: Discount Value", value: "discountValue" },
                { label: "Sort: Expiry Date", value: "expiryDate" },
              ]}
            />

            <Select
              value={filters.sortOrder}
              onChange={(val) => handleFilterChange("sortOrder", val)}
              options={[
                { label: "Descending", value: "desc" },
                { label: "Ascending", value: "asc" },
              ]}
            />

            <Select
              value={filters.limit}
              onChange={(val) => handleFilterChange("limit", val)}
              options={[
                { label: "10 per page", value: 10 },
                { label: "20 per page", value: 20 },
                { label: "50 per page", value: 50 },
              ]}
            />
          </div>
        </div>
      </Card>

      {(actionError || error) && (
        <Alert
          type="error"
          showIcon
          title={actionError || error}
          closable={Boolean(actionError)}
          onClose={() => setActionError("")}
        />
      )}

      {/* Coupons Table */}
      <Card
        className="overflow-hidden border-[#E2E8F0] shadow-xs"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={coupons}
          loading={loading}
          pagination={false}
          scroll={{ x: 980 }}
          locale={{
            emptyText: (
              <Empty
                description="No coupons match your filters"
                className="py-10"
              />
            ),
          }}
        />

        {pagination && pagination.totalCoupons > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E8F0] px-5 py-4 sm:flex-row">
            <p className="text-xs text-[#64748B]">
              Showing{" "}
              <span className="font-semibold text-[#101828]">
                {coupons.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#101828]">
                {pagination.totalCoupons}
              </span>{" "}
              coupons
            </p>

            <Pagination
              current={pagination.currentPage || filters.page}
              pageSize={filters.limit}
              total={pagination.totalCoupons}
              showSizeChanger={false}
              onChange={(page) =>
                setFilters((previous) => ({ ...previous, page }))
              }
            />
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        open={Boolean(couponToDelete)}
        title="Delete Coupon"
        onCancel={() => !deletingCouponId && setCouponToDelete(null)}
        onOk={handleConfirmDelete}
        okText="Delete Coupon"
        okButtonProps={{ danger: true, loading: Boolean(deletingCouponId) }}
        cancelButtonProps={{ disabled: Boolean(deletingCouponId) }}
      >
        <p className="text-sm text-[#475569]">
          Are you sure you want to permanently delete coupon{" "}
          <span className="font-mono font-bold text-[#101828]">
            {couponToDelete?.code}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
