"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { Pencil, Plus, RefreshCw, Search, Store, Trash2 } from "lucide-react";

import useAdminBrands from "@/hooks/useAdminBrands";
import brandService from "@/services/brandService";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export default function AdminBrandsPage() {
  const { notification } = AntdApp.useApp();
  const { brands, loading, error, refreshBrands } = useAdminBrands();

  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return brands;
    return brands.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.slug?.toLowerCase().includes(term) ||
        b.description?.toLowerCase().includes(term),
    );
  }, [brands, search]);

  const handleToggleStatus = async (brand) => {
    if (updatingStatusId) return;
    try {
      setUpdatingStatusId(brand._id);
      const res = await brandService.toggleBrandStatus(brand._id);
      notification.success({
        message: "Brand Updated",
        description: res.message || "Brand status updated.",
      });
      await refreshBrands();
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description: err.response?.data?.message || "Failed to update brand.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id || deleting) return;
    try {
      setDeleting(true);
      await brandService.deleteBrand(deleteTarget._id);
      notification.success({
        message: "Brand Deleted",
        description: `"${deleteTarget.name}" removed.`,
      });
      setDeleteTarget(null);
      await refreshBrands();
    } catch (err) {
      notification.error({
        message: "Delete Failed",
        description: err.response?.data?.message || "Failed to delete brand.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: "Brand",
      key: "brand",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          {r.logo?.url ? (
            <img
              src={r.logo.url}
              alt={r.name}
              className="h-10 w-10 rounded-lg border border-[#E2E8F0] object-contain p-1"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <Store size={17} />
            </div>
          )}
          <div>
            <p className="font-bold text-[#101828]">{r.name}</p>
            <p className="text-xs text-[#64748B]">{r.slug}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (d) => (
        <span className="line-clamp-2 max-w-xs text-xs text-[#64748B]">
          {d || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <Space>
          <Switch
            size="small"
            checked={Boolean(r.isActive)}
            loading={updatingStatusId === r._id}
            onChange={() => handleToggleStatus(r)}
          />
          <Tag color={r.isActive ? "green" : "default"}>
            {r.isActive ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Edit brand">
            <Link href={`/admin/brands/${r._id}/edit`}>
              <Button size="small" icon={<Pencil size={13} />} />
            </Link>
          </Tooltip>
          <Tooltip title="Delete brand">
            <Button
              size="small"
              danger
              icon={<Trash2 size={13} />}
              onClick={() => setDeleteTarget(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Brands"
        subtitle="Manage verified manufacturer and gadget brand partners."
        badge={`${brands.length} Brands`}
        extra={
          <>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshBrands}
            >
              Refresh
            </Button>
            <Link href="/admin/brands/create">
              <Button type="primary" icon={<Plus size={15} />}>
                Create Brand
              </Button>
            </Link>
          </>
        }
      />

      <Card className="!border-[#E2E8F0]">
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search size={15} className="text-[#94A3B8]" />}
          placeholder="Search brands..."
          className="max-w-md"
        />
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredBrands}
          loading={loading}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Brand?"
        onCancel={() => !deleting && setDeleteTarget(null)}
        onOk={handleConfirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleting }}
      >
        <p className="text-sm text-[#64748B]">
          Delete brand{" "}
          <strong className="text-[#101828]">{deleteTarget?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
