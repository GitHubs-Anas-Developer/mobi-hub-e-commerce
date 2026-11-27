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
import {
  FolderTree,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import useAdminCategories from "@/hooks/useAdminCategories";
import categoryService from "@/services/categoryService";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

export default function AdminCategoriesPage() {
  const { notification } = AntdApp.useApp();
  const { categories, loading, error, refreshCategories } =
    useAdminCategories();

  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredCategories = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return categories;
    return categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(searchTerm) ||
        cat.slug?.toLowerCase().includes(searchTerm) ||
        cat.parentCategory?.name?.toLowerCase().includes(searchTerm),
    );
  }, [categories, search]);

  const handleToggleStatus = async (category) => {
    if (updatingStatusId) return;
    try {
      setUpdatingStatusId(category._id);
      const response = await categoryService.toggleCategoryStatus(category._id);
      notification.success({
        message: "Category Updated",
        description: response.message || "Category status updated.",
      });
      await refreshCategories();
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description:
          err.response?.data?.message || "Failed to update category status.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id || deleting) return;
    try {
      setDeleting(true);
      const response = await categoryService.deleteCategory(deleteTarget._id);
      notification.success({
        message: "Category Deleted",
        description: response.message || "Category removed.",
      });
      setDeleteTarget(null);
      await refreshCategories();
    } catch (err) {
      notification.error({
        message: "Delete Failed",
        description:
          err.response?.data?.message || "Failed to delete category.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: "Category",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.image?.url ? (
            <img
              src={record.image.url}
              alt={record.name}
              className="h-10 w-10 rounded-lg border border-[#E2E8F0] object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <FolderTree size={17} />
            </div>
          )}
          <div>
            <p className="font-bold text-[#101828]">{record.name}</p>
            <p className="text-xs text-[#64748B]">{record.slug}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Level / Parent",
      key: "parent",
      render: (_, record) =>
        record.parentCategory?.name ? (
          <Tag color="blue">{record.parentCategory.name}</Tag>
        ) : (
          <Tag>Root Category</Tag>
        ),
    },
    {
      title: "Sort Order",
      dataIndex: "sortOrder",
      key: "sortOrder",
      render: (val) => <span className="font-semibold">{val ?? 0}</span>,
    },
    {
      title: "Status",
      key: "isActive",
      render: (_, record) => (
        <Space>
          <Switch
            size="small"
            checked={Boolean(record.isActive)}
            loading={updatingStatusId === record._id}
            onChange={() => handleToggleStatus(record)}
          />
          <Tag color={record.isActive ? "green" : "default"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit category">
            <Link href={`/admin/categories/${record._id}/edit`}>
              <Button size="small" icon={<Pencil size={13} />} />
            </Link>
          </Tooltip>
          <Tooltip title="Delete category">
            <Button
              size="small"
              danger
              icon={<Trash2 size={13} />}
              onClick={() => setDeleteTarget(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        subtitle="Manage top-level product categories and hierarchy ordering."
        badge={`${categories.length} Total`}
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
                Create Category
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
          placeholder="Search categories or parent departments..."
          className="max-w-md"
        />
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 760 }}
        />
      </Card>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Category?"
        onCancel={() => !deleting && setDeleteTarget(null)}
        onOk={handleConfirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleting }}
      >
        <p className="text-sm text-[#64748B]">
          Delete category <strong className="text-[#101828]">{deleteTarget?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
