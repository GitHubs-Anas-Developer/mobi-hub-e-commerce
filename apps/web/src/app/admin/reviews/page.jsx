"use client";

import { useState } from "react";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Input,
  Pagination,
  Rate,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
} from "antd";
import { Eye, EyeOff, MessageSquare, RefreshCw, Search } from "lucide-react";

import useAdminReviews from "@/hooks/useAdminReviews";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AdminReviewsPage() {
  const { notification } = AntdApp.useApp();
  const {
    reviews,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingReviewId,
    refreshReviews,
    updateReviewVisibility,
  } = useAdminReviews();

  const [search, setSearch] = useState(filters.search);

  const handleToggleVisibility = async (review) => {
    if (updatingReviewId) return;
    const nextVis = !review.isVisible;
    try {
      await updateReviewVisibility(review._id, nextVis);
      notification.success({
        message: "Review Updated",
        description: nextVis
          ? "Review is now public on storefront."
          : "Review hidden from storefront.",
      });
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description:
          err.response?.data?.message || "Failed to update visibility.",
      });
    }
  };

  const visibleCount = reviews.filter((r) => r.isVisible).length;
  const hiddenCount = reviews.filter((r) => !r.isVisible).length;

  const columns = [
    {
      title: "Product & Reviewer",
      key: "product",
      render: (_, r) => (
        <div className="min-w-0">
          <p className="truncate font-bold text-[#101828]">
            {r.product?.name || "Product"}
          </p>
          <p className="truncate text-xs text-[#64748B]">
            by {r.user?.name || "Customer"} ({r.user?.email || "—"})
          </p>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      render: (rating) => <Rate disabled value={Number(rating || 0)} />,
    },
    {
      title: "Feedback",
      dataIndex: "comment",
      render: (comment, r) => (
        <div className="max-w-sm">
          {r.title && (
            <p className="text-xs font-bold text-[#101828]">{r.title}</p>
          )}
          <p className="line-clamp-2 text-xs text-[#64748B]">
            {comment || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Visibility",
      key: "isVisible",
      render: (_, r) => (
        <Space>
          <Switch
            size="small"
            checked={Boolean(r.isVisible)}
            loading={updatingReviewId === r._id}
            onChange={() => handleToggleVisibility(r)}
          />
          <Tag color={r.isVisible ? "green" : "default"}>
            {r.isVisible ? "Visible" : "Hidden"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) => <span className="text-xs text-[#64748B]">{formatDate(d)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Reviews"
        subtitle="Moderate customer ratings and toggle review visibility on product pages."
        badge={`${pagination?.total ?? 0} Reviews`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={refreshReviews}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Total Reviews"
            value={pagination?.total ?? 0}
            prefix={<MessageSquare size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Visible (Page)"
            value={visibleCount}
            prefix={<Eye size={16} className="mr-1 text-emerald-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Hidden (Page)"
            value={hiddenCount}
            prefix={<EyeOff size={16} className="mr-1 text-red-600" />}
          />
        </Card>
      </div>

      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilters((p) => ({ ...p, search: e.target.value, page: 1 }));
              }}
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search product, customer or comment..."
            />
          </div>
          <Select
            value={filters.visibility}
            onChange={(visibility) =>
              setFilters((p) => ({ ...p, visibility, page: 1 }))
            }
            options={[
              { value: "all", label: "All Visibility" },
              { value: "visible", label: "Visible Only" },
              { value: "hidden", label: "Hidden Only" },
            ]}
          />
          <Select
            value={filters.rating}
            onChange={(rating) => setFilters((p) => ({ ...p, rating, page: 1 }))}
            options={[
              { value: "all", label: "All Ratings" },
              { value: "5", label: "5 Stars" },
              { value: "4", label: "4 Stars" },
              { value: "3", label: "3 Stars" },
              { value: "2", label: "2 Stars" },
              { value: "1", label: "1 Star" },
            ]}
          />
        </div>
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={reviews}
          loading={loading}
          pagination={false}
          scroll={{ x: 820 }}
        />
        <div className="flex justify-end border-t border-[#E2E8F0] px-5 py-4">
          <Pagination
            current={pagination?.page || filters.page}
            total={pagination?.total || 0}
            pageSize={filters.limit}
            onChange={(page, limit) => setFilters((p) => ({ ...p, page, limit }))}
          />
        </div>
      </Card>
    </div>
  );
}
