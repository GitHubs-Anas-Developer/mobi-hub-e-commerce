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
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import useAdminCategories from "@/hooks/useAdminCategories";
import categoryService from "@/services/categoryService";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export default function AdminSubcategoriesPage() {
  const { notification } = AntdApp.useApp();
  const { categories, loading, error, refreshCategories } =
    useAdminCategories();

  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rootParents = useMemo(
    () => categories.filter((c) => !c.parentCategory),
    [categories],
  );

  const subcategories = useMemo(() => {
    const childList = categories.filter((c) => Boolean(c.parentCategory));
    const term = search.trim().toLowerCase();

    return childList.filter((sub) => {
      const parentId =
        typeof sub.parentCategory === "object"
          ? sub.parentCategory?._id
          : sub.parentCategory;

      if (parentFilter !== "all" && parentId !== parentFilter) {
        return false;
      }

      if (!term) return true;
      return (
        sub.name?.toLowerCase().includes(term) ||
        sub.slug?.toLowerCase().includes(term) ||
        sub.parentCategory?.name?.toLowerCase().includes(term)
      );
    });
  }, [categories, search, parentFilter]);

  const handleToggleStatus = async (sub) => {
    if (updatingStatusId) return;
    try {
      setUpdatingStatusId(sub._id);
      const res = await categoryService.toggleCategoryStatus(sub._id);
      notification.success({
        message: "Subcategory Updated",
        description: res.message || "Status updated.",
      });
      await refreshCategories();
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description: err.response?.data?.message || "Unable to update status.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id || deleting) return;
    try {
      setDeleting(true);
      await categoryService.deleteCategory(deleteTarget._id);
      notification.success({
        message: "Subcategory Deleted",
        description: `"${deleteTarget.name}" removed.`,
      });
      setDeleteTarget(null);
      await refreshCategories();
    } catch (err) {
      notification.error({
        message: "Delete Failed",
        description:
          err.response?.data?.message || "Failed to delete subcategory.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: "Subcategory",
      key: "name",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
            <Layers size={16} />
          </div>
          <div>
            <p className="font-bold text-[#101828]">{r.name}</p>
            <p className="text-xs text-[#64748B]">{r.slug}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Parent Category",
      key: "parent",
      render: (_, r) => (
        <Tag color="blue">{r.parentCategory?.name || "Parent Category"}</Tag>
      ),
    },
    {
      title: "Sort Order",
      dataIndex: "sortOrder",
      render: (val) => val ?? 0,
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
          <Tooltip title="Edit subcategory">
            <Link href={`/admin/categories/${r._id}/edit`}>
              <Button size="small" icon={<Pencil size={13} />} />
            </Link>
          </Tooltip>
          <Tooltip title="Delete subcategory">
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
        title="Subcategories"
        subtitle="Browse and manage child categories nested under root departments."
        badge={`${subcategories.length} Subcategories`}
        extra={
          <>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshCategories}
            >
              Refresh
            </Button>
            <Link href="/admin/categories/create">
              <Button type="primary" icon={<Plus size={15} />}>
                Add Subcategory
              </Button>
            </Link>
          </>
        }
      />

      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search subcategories..."
            />
          </div>
          <Select
            value={parentFilter}
            onChange={setParentFilter}
            options={[
              { value: "all", label: "All Parent Departments" },
              ...rootParents.map((p) => ({ value: p._id, label: p.name })),
            ]}
          />
        </div>
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={subcategories}
          loading={loading}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 740 }}
        />
      </Card>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Subcategory?"
        onCancel={() => !deleting && setDeleteTarget(null)}
        onOk={handleConfirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleting }}
      >
        <p className="text-sm text-[#64748B]">
          Delete subcategory{" "}
          <strong className="text-[#101828]">{deleteTarget?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}

