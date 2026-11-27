"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import {
  deleteBanner,
  fetchAdminBanners,
  updateBanner,
} from "@/store/thunks/bannerThunks";

const formatLabel = (value) => {
  if (!value) return "General";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getTargetName = (target) => {
  if (!target) return "All";
  if (typeof target === "string") return target;
  return target.name || target.title || "All";
};

export default function AdminBannersPage() {
  const dispatch = useDispatch();
  const { message } = App.useApp();

  const {
    adminBanners = [],
    adminLoading: loading,
    error,
  } = useSelector((state) => state.banners);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingBannerId, setDeletingBannerId] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  const refreshBanners = () => {
    setActionError("");
    dispatch(fetchAdminBanners());
  };

  const placements = useMemo(() => {
    const unique = new Set(
      adminBanners.map((banner) => banner.placement || "home").filter(Boolean),
    );
    return Array.from(unique);
  }, [adminBanners]);

  const filteredBanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return adminBanners.filter((banner) => {
      if (statusFilter === "active" && !banner.isActive) return false;
      if (statusFilter === "inactive" && banner.isActive) return false;

      const bannerPlacement = banner.placement || "home";
      if (placementFilter !== "all" && bannerPlacement !== placementFilter) {
        return false;
      }

      if (!query) return true;

      const categoryName = getTargetName(banner.targetCategory).toLowerCase();
      const subCategoryName = getTargetName(
        banner.targetSubCategory,
      ).toLowerCase();

      return (
        banner.title?.toLowerCase().includes(query) ||
        banner.subtitle?.toLowerCase().includes(query) ||
        bannerPlacement.toLowerCase().includes(query) ||
        banner.position?.toLowerCase().includes(query) ||
        categoryName.includes(query) ||
        subCategoryName.includes(query)
      );
    });
  }, [adminBanners, search, statusFilter, placementFilter]);

  const activeCount = useMemo(
    () => adminBanners.filter((banner) => banner.isActive).length,
    [adminBanners],
  );
  const inactiveCount = adminBanners.length - activeCount;

  const handleToggleStatus = async (banner) => {
    try {
      setActionError("");
      setUpdatingStatusId(banner._id);
      const nextStatus = !banner.isActive;

      await dispatch(
        updateBanner({
          bannerId: banner._id,
          bannerData: { isActive: nextStatus },
          files: {},
        }),
      ).unwrap();

      message.success(
        `Banner "${banner.title}" ${nextStatus ? "activated" : "deactivated"}.`,
      );
    } catch (err) {
      setActionError(err || "Failed to update banner status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      setActionError("");
      setDeletingBannerId(bannerToDelete._id);
      await dispatch(deleteBanner(bannerToDelete._id)).unwrap();
      message.success(`Banner "${bannerToDelete.title}" deleted.`);
      setBannerToDelete(null);
    } catch (err) {
      setActionError(err || "Failed to delete banner.");
    } finally {
      setDeletingBannerId(null);
    }
  };

  const columns = [
    {
      title: "Banner",
      key: "banner",
      width: 300,
      render: (_, banner) => (
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            {banner.desktopImage ? (
              <img
                src={banner.desktopImage}
                alt={banner.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={20} className="text-[#94A3B8]" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-[#101828]">
              {banner.title}
            </p>
            <p className="truncate text-xs text-[#64748B]">
              {banner.subtitle || "No subtitle"}
            </p>
            <Tag className="!mt-1 !text-[10px]">
              {banner.mobileImage ? "Desktop + Mobile" : "Desktop Only"}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Placement & Position",
      key: "placement",
      width: 170,
      render: (_, banner) => (
        <div>
          <Tag color="blue" className="!mb-1">
            {formatLabel(banner.placement || "home")}
          </Tag>
          <p className="text-xs text-[#64748B]">
            Pos: {formatLabel(banner.position || "hero")}
          </p>
        </div>
      ),
    },
    {
      title: "Target Audience",
      key: "target",
      width: 170,
      render: (_, banner) => (
        <div className="text-xs text-[#475569]">
          <p className="truncate">
            <span className="font-semibold text-[#101828]">Cat:</span>{" "}
            {getTargetName(banner.targetCategory)}
          </p>
          <p className="mt-0.5 truncate">
            <span className="font-semibold text-[#101828]">Sub:</span>{" "}
            {getTargetName(banner.targetSubCategory)}
          </p>
        </div>
      ),
    },
    {
      title: "CTA & Link",
      key: "cta",
      width: 170,
      render: (_, banner) => (
        <div className="text-xs">
          <p className="font-semibold text-[#101828]">
            {banner.buttonText || "Shop Now"}
          </p>
          <p className="mt-0.5 truncate text-[#64748B]">
            {banner.buttonLink || "/products"}
          </p>
        </div>
      ),
    },
    {
      title: "Schedule",
      key: "schedule",
      width: 150,
      render: (_, banner) => (
        <div className="text-xs text-[#475569]">
          <p>
            <span className="text-[#64748B]">Start:</span>{" "}
            {banner.startDate
              ? new Date(banner.startDate).toLocaleDateString("en-IN")
              : "Immediate"}
          </p>
          <p className="mt-0.5">
            <span className="text-[#64748B]">End:</span>{" "}
            {banner.endDate
              ? new Date(banner.endDate).toLocaleDateString("en-IN")
              : "No expiry"}
          </p>
        </div>
      ),
    },
    {
      title: "Order",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 80,
      align: "center",
      render: (order) => (
        <span className="font-semibold text-[#334155]">{order ?? 0}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 145,
      render: (_, banner) => (
        <div className="flex items-center gap-2">
          <Switch
            size="small"
            checked={Boolean(banner.isActive)}
            loading={updatingStatusId === banner._id}
            disabled={Boolean(deletingBannerId)}
            onChange={() => handleToggleStatus(banner)}
            aria-label={`Toggle ${banner.title}`}
          />
          <Tag color={banner.isActive ? "success" : "default"}>
            {banner.isActive ? "Active" : "Inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      align: "right",
      render: (_, banner) => {
        const isBusy =
          updatingStatusId === banner._id || deletingBannerId === banner._id;

        return (
          <div className="flex items-center justify-end gap-2">
            <Tooltip title="Edit banner">
              <Link href={`/admin/banners/${banner._id}/edit`}>
                <Button
                  size="small"
                  icon={<Pencil size={14} />}
                  disabled={isBusy}
                />
              </Link>
            </Tooltip>

            <Tooltip title="Delete banner">
              <Button
                size="small"
                danger
                icon={<Trash2 size={14} />}
                loading={deletingBannerId === banner._id}
                disabled={isBusy}
                onClick={() => setBannerToDelete(banner)}
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
        title="Promotional Banners"
        subtitle="Manage homepage hero sliders, campaign cards, and category storefront placements."
        badge={`${adminBanners.length} Banners`}
        extra={
          <>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshBanners}
              disabled={loading}
            >
              Refresh
            </Button>

            <Link href="/admin/banners/create">
              <Button type="primary" icon={<Plus size={16} />}>
                Add Banner
              </Button>
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Total Banners"
            value={adminBanners.length}
            prefix={<Layers size={18} className="text-[#0755E9]" />}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Active Banners"
            value={activeCount}
            prefix={<CheckCircle2 size={18} className="text-emerald-600" />}
            styles={{ content: { color: "#059669" } }}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Inactive Banners"
            value={inactiveCount}
            prefix={<Power size={18} className="text-[#64748B]" />}
            styles={{ content: { color: "#475569" } }}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-[#E2E8F0] shadow-xs">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <Input
              size="large"
              allowClear
              prefix={<Search size={16} className="text-[#64748B]" />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search banners by title, placement, category..."
            />
          </div>

          <div className="md:col-span-3">
            <Select
              size="large"
              className="w-full"
              value={placementFilter}
              onChange={setPlacementFilter}
              options={[
                { label: "All Placements", value: "all" },
                ...placements.map((placement) => ({
                  label: formatLabel(placement),
                  value: placement,
                })),
              ]}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              size="large"
              className="w-full"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active Only", value: "active" },
                { label: "Inactive Only", value: "inactive" },
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

      {/* Table */}
      <Card
        className="overflow-hidden border-[#E2E8F0] shadow-xs"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredBanners}
          loading={loading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 1120 }}
          locale={{
            emptyText: (
              <Empty description="No banners found" className="py-10" />
            ),
          }}
        />
      </Card>

      {/* Delete Confirmation */}
      <Modal
        open={Boolean(bannerToDelete)}
        title="Delete Banner"
        onCancel={() => !deletingBannerId && setBannerToDelete(null)}
        onOk={handleConfirmDelete}
        okText="Delete Banner"
        okButtonProps={{ danger: true, loading: Boolean(deletingBannerId) }}
        cancelButtonProps={{ disabled: Boolean(deletingBannerId) }}
      >
        <p className="text-sm text-[#475569]">
          Are you sure you want to delete banner{" "}
          <span className="font-semibold text-[#101828]">
            {bannerToDelete?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
