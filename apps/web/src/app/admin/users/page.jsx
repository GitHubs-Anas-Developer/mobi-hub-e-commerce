"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  App as AntdApp,
  Avatar,
  Card,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
} from "antd";
import {
  Button,
} from "antd";
import { RefreshCw, Search, ShieldCheck, UserCheck, Users, UserX } from "lucide-react";

import useAdminUsers from "@/hooks/useAdminUsers";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

const formatDate = (date) => {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminUsersPage() {
  const { notification } = AntdApp.useApp();
  const {
    users,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingUserId,
    refreshUsers,
    updateUserStatus,
  } = useAdminUsers();

  const [search, setSearch] = useState(filters.search);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = search.trim();
      if (value !== filters.search) {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [search, filters.search, setFilters]);

  const handleConfirmStatus = async () => {
    if (!confirmTarget?._id) return;
    const nextStatus = !confirmTarget.isActive;
    try {
      await updateUserStatus(confirmTarget._id, nextStatus);
      notification.success({
        message: "Customer Updated",
        description: nextStatus
          ? `${confirmTarget.name} activated.`
          : `${confirmTarget.name} deactivated.`,
      });
      setConfirmTarget(null);
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description: err.response?.data?.message || "Failed to update status.",
      });
    }
  };

  const activeOnPage = users.filter((u) => u.isActive).length;
  const verifiedOnPage = users.filter((u) => u.isEmailVerified).length;

  const columns = [
    {
      title: "Customer",
      key: "name",
      render: (_, r) => {
        const initials = String(r.name || "C").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="!bg-[#EFF6FF] !font-bold !text-[#0755E9]">
              {initials}
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-bold text-[#101828]">{r.name}</p>
              <p className="truncate text-xs text-[#64748B]">{r.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (p) => <span className="text-xs text-[#475569]">{p || "—"}</span>,
    },
    {
      title: "Verification",
      dataIndex: "isEmailVerified",
      render: (verified) => (
        <Tag color={verified ? "green" : "gold"}>
          {verified ? "Verified" : "Unverified"}
        </Tag>
      ),
    },
    {
      title: "Account Status",
      key: "isActive",
      render: (_, record) => (
        <Space>
          <Switch
            size="small"
            checked={Boolean(record.isActive)}
            loading={updatingUserId === record._id}
            onChange={() => setConfirmTarget(record)}
          />
          <Tag color={record.isActive ? "blue" : "red"}>
            {record.isActive ? "Active" : "Suspended"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Joined / Last Active",
      key: "dates",
      render: (_, r) => (
        <div className="text-xs text-[#64748B]">
          <p>Joined: {formatDate(r.createdAt)}</p>
          <p>Last login: {formatDate(r.lastLoginAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers Directory"
        subtitle="Inspect registered customers, email verification state, and account access."
        badge={`${pagination?.total ?? 0} Customers`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={refreshUsers}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Total Customers"
            value={pagination?.total ?? 0}
            prefix={<Users size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Active (Page)"
            value={activeOnPage}
            prefix={<UserCheck size={16} className="mr-1 text-emerald-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Email Verified (Page)"
            value={verifiedOnPage}
            prefix={<ShieldCheck size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
      </div>

      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search customer name, email or phone..."
            />
          </div>
          <Select
            value={filters.status}
            onChange={(status) => setFilters((p) => ({ ...p, status, page: 1 }))}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Suspended" },
            ]}
          />
          <Select
            value={filters.verification}
            onChange={(verification) =>
              setFilters((p) => ({ ...p, verification, page: 1 }))
            }
            options={[
              { value: "all", label: "All Verification" },
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
            ]}
          />
        </div>
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
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

      <Modal
        open={Boolean(confirmTarget)}
        title={
          confirmTarget?.isActive
            ? "Deactivate Customer Account?"
            : "Activate Customer Account?"
        }
        onCancel={() => !updatingUserId && setConfirmTarget(null)}
        onOk={handleConfirmStatus}
        okText={confirmTarget?.isActive ? "Deactivate" : "Activate"}
        okButtonProps={{
          danger: Boolean(confirmTarget?.isActive),
          loading: Boolean(updatingUserId),
          icon: confirmTarget?.isActive ? (
            <UserX size={14} />
          ) : (
            <UserCheck size={14} />
          ),
        }}
      >
        <p className="text-sm text-[#64748B]">
          Confirm status change for{" "}
          <strong className="text-[#101828]">{confirmTarget?.name}</strong> (
          {confirmTarget?.email})?
        </p>
      </Modal>
    </div>
  );
}
